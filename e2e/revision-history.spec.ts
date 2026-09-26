import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * The revision history, end to end: a snapshot written by a real edit, read back
 * through the drawer, and restored into a live Tiptap editor.
 *
 * Seeding goes through the API (register → novel → episode → edit), because that
 * is the only way to guarantee a snapshot exists with known content.
 */

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
const ORIGINAL = 'The lamp was still warm when she reached for it.';
const EDITED = 'By morning the lamp had gone cold and the room was empty.';

async function seedEditedEpisode(request: APIRequestContext) {
  const email = `revisions-${Date.now()}@example.com`;

  const register = await request.post(`${API_URL}/auth/register`, {
    data: { email, name: 'E2E', password: 'e2e-password-123' },
  });
  expect(register.ok(), `register: ${register.status()} ${await register.text()}`).toBeTruthy();
  const { access_token: token } = (await register.json()) as { access_token: string };
  const headers = { Authorization: `Bearer ${token}` };

  const novel = await request.post(`${API_URL}/novels`, {
    headers,
    data: { title: `E2E revisions ${Date.now()}`, status: 'draft' },
  });
  expect(novel.ok(), `create novel: ${novel.status()} ${await novel.text()}`).toBeTruthy();
  const { id: novelId } = (await novel.json()) as { id: string };

  const episode = await request.post(`${API_URL}/novels/${novelId}/episodes`, {
    headers,
    data: { title: 'Revision episode', content: ORIGINAL, isPublished: false },
  });
  expect(episode.ok(), `create episode: ${episode.status()} ${await episode.text()}`).toBeTruthy();
  const { id: episodeId } = (await episode.json()) as { id: string };

  // One edit → one snapshot, holding the text as it was before the edit.
  const edit = await request.patch(`${API_URL}/episodes/${episodeId}`, {
    headers,
    data: { content: EDITED },
  });
  expect(edit.ok(), `edit episode: ${edit.status()} ${await edit.text()}`).toBeTruthy();

  return { token, novelId, episodeId };
}

test('a writer can see an earlier version and put it back', async ({ page, request }) => {
  const seed = await seedEditedEpisode(request);
  await page.addInitScript(
    ([value]) => window.localStorage.setItem('token', value as string),
    [seed.token],
  );

  await page.goto(`/writer/novel/${seed.novelId}/episode/${seed.episodeId}`);

  // The editor is rendering the edited text, scoped so the assertion is about the
  // document and not about the drawer that also mentions the same strings.
  const document = page.locator('.prose-editor');
  await expect(document).toContainText(EDITED);

  await page.getByRole('button', { name: 'History', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Episode revision history' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText(ORIGINAL);

  await drawer.getByRole('button', { name: 'กู้คืน' }).first().click();
  await drawer.getByRole('button', { name: 'ยืนยัน' }).click();

  // The document shows the restored text again…
  await expect(document).toContainText(ORIGINAL);

  // …and the text that was live before the restore is now itself a snapshot,
  // so restoring the wrong version is reversible.
  await expect(drawer).toContainText(EDITED);
});
