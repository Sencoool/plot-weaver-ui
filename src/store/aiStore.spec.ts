import { describe, expect, it } from 'vitest';
import { buildConversationHistory } from './aiStore';
import type { ChatMessage } from '../types/ai';

function msg(i: number, status: ChatMessage['status'] = 'done'): ChatMessage {
  return {
    id: `m${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `content ${i}`,
    status,
    timestamp: new Date('2026-01-01T00:00:00Z'),
  };
}

describe('buildConversationHistory', () => {
  it('sends at most 20 turns because the API rejects more', () => {
    const history = buildConversationHistory(
      Array.from({ length: 25 }, (_, i) => msg(i)),
    );
    expect(history).toHaveLength(20);
  });

  it('keeps the most recent turns in chronological order', () => {
    const history = buildConversationHistory(
      Array.from({ length: 25 }, (_, i) => msg(i)),
    );
    expect(history[0].content).toBe('content 5');
    expect(history[19].content).toBe('content 24');
  });

  it('drops failed turns before applying the window', () => {
    const messages = [
      msg(0, 'error'),
      ...Array.from({ length: 21 }, (_, i) => msg(i + 1)),
    ];
    const history = buildConversationHistory(messages);
    expect(history).toHaveLength(20);
    expect(history.some((t) => t.content === 'content 0')).toBe(false);
  });

  it('caps each turn at the 6000 char API limit', () => {
    const history = buildConversationHistory([
      { ...msg(1), content: 'x'.repeat(7000) },
    ]);
    expect(history[0].content).toHaveLength(6000);
  });
});