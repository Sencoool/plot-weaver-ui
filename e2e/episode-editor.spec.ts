import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

/**
 * End-to-end coverage for what unit tests cannot reach: the editor mounting real
 * API data, and the streaming chat round-trip surviving a reload (the bug that
 * started all of this — replies were never persisted).
 *
 * Prerequisites, both running:
 *   narrax-api  → npm run start:dev      (needs Postgres; see its README)
 *   narrax-ui   → npm run dev            (started automatically by the config)
 *
 * Data is seeded through the API rather than by driving the UI's create flows, so
 * a failure here points at the feature under test and not at another form.
 *
 * The second test drives a real AI generation, so it needs a working provider for
 * the seeded user; it is opt-in via E2E_AI_ENABLED=1 and is skipped otherwise.
 */

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
const PASSWORD = 'e2e-password-123';
const SEED_TEXT = 'The lamp was still warm when she reached for it.';

interface Seed {
  token: string;
  novelId: string;
  episodeId: string;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: string;
}

/** Creates a throwaway writer, novel and episode straight through the API. */
async function seedEpisode(request: APIRequestContext): Promise<Seed> {
  const email = `e2e-${Date.now()}@example.com`;

  const register = await request.post(`${API_URL}/auth/register`, {
    data: { email, name: 'E2E', password: PASSWORD },
  });
  expect(register.ok(), `register: ${register.status()} ${await register.text()}`).toBeTruthy();
  const { access_token: token } = (await register.json()) as { access_token: string };

  const headers = { Authorization: `Bearer ${token}` };

  const novel = await request.post(`${API_URL}/novels`, {
    headers,
    // `summary` is optional but NOT nullable -- sending null fails validation.
    data: { title: `E2E novel ${Date.now()}`, status: 'draft' },
  });
  expect(novel.ok(), `create novel: ${novel.status()} ${await novel.text()}`).toBeTruthy();
  const { id: novelId } = (await novel.json()) as { id: string };

  const episode = await request.post(`${API_URL}/novels/${novelId}/episodes`, {
    headers,
    data: { title: 'E2E episode', content: SEED_TEXT, isPublished: false },
  });
  expect(episode.ok(), `create episode: ${episode.status()} ${await episode.text()}`).toBeTruthy();
  const { id: episodeId } = (await episode.json()) as { id: string };

  return { token, novelId, episodeId };
}

/** Puts the JWT where the app reads it, before the first navigation. */
async function signIn(page: Page, token: string): Promise<void> {
  await page.addInitScript(
    ([value]) => window.localStorage.setItem('token', value as string),
    [token],
  );
}

function episodePath(seed: Seed): string {
  return `/writer/novel/${seed.novelId}/episode/${seed.episodeId}`;
}

async function conversation(
  request: APIRequestContext,
  seed: Seed,
): Promise<ConversationMessage[]> {
  const response = await request.get(
    `${API_URL}/episodes/${seed.episodeId}/conversation`,
    { headers: { Authorization: `Bearer ${seed.token}` } },
  );
  expect(response.ok(), `conversation: ${response.status()}`).toBeTruthy();
  return (await response.json()) as ConversationMessage[];
}

/**
 * Waits for the assistant's turn to reach a terminal state server-side, then
 * returns it. The API — not the DOM — decides when the generation is finished.
 */
async function waitForAssistantReply(
  request: APIRequestContext,
  seed: Seed,
  timeoutMs = 90_000,
): Promise<ConversationMessage> {
  const terminal = ['done', 'accepted', 'rejected', 'error'];
  const deadline = Date.now() + timeoutMs;
  let last: ConversationMessage | null = null;

  while (Date.now() < deadline) {
    const messages = await conversation(request, seed);
    const assistants = messages.filter((message) => message.role === 'assistant');
    last = assistants.length > 0 ? assistants[assistants.length - 1] : null;

    if (last && terminal.includes(last.status)) return last;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(
    `no assistant turn reached a terminal state within ${timeoutMs}ms; last seen: ${JSON.stringify(last)}`,
  );
}

test('a writer can open their own episode in the editor', async ({ page, request }) => {
  const seed = await seedEpisode(request);
  await signIn(page, seed.token);

  await page.goto(episodePath(seed));

  // Not redirected to /login, and the episode's text is rendered in the editor.
  await expect(page).toHaveURL(new RegExp(`/writer/novel/${seed.novelId}/episode/`));
  await expect(page.getByText(SEED_TEXT)).toBeVisible();
});

test('a streamed AI reply is still there after a reload', async ({ page, request }) => {
  test.skip(
    process.env.E2E_AI_ENABLED !== '1',
    'Drives a real generation: needs a configured, reachable AI provider. Set E2E_AI_ENABLED=1 to run it.',
  );

  const seed = await seedEpisode(request);
  await signIn(page, seed.token);
  await page.goto(episodePath(seed));

  const composer = page.getByPlaceholder(/Instruct AI/);
  await expect(composer).toBeVisible();
  await composer.fill('Continue the scene in one sentence.');
  await composer.press('Enter');

  const reply = await waitForAssistantReply(request, seed);
  expect(
    reply.status,
    `the provider returned ${reply.status} — check the AI configuration`,
  ).toBe('done');

  // The assertion uses the text the API stored, so it cannot drift with the
  // editor's markup.
  await page.reload();
  await expect(page.getByText(reply.content.slice(0, 60))).toBeVisible();
});
