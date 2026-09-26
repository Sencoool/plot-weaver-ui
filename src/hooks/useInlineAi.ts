import { useRef, useCallback, useState } from 'react';
import { streamStoryGeneration } from '../services/aiService';
import type { Editor } from '@tiptap/react';

export type InlineAiAction = 'rewrite' | 'expand' | 'to-dialogue' | 'translate' | 'custom';

export type InlineAiPhase =
  | { phase: 'idle' }
  | { phase: 'generating'; action: InlineAiAction; originalText: string; from: number; to: number }
  | { phase: 'preview'; action: InlineAiAction; originalText: string; suggestedText: string; from: number; to: number };

const ACTION_PROMPTS: Record<InlineAiAction, (text: string) => string> = {
  rewrite: (text) =>
    `เขียนข้อความต่อไปนี้ใหม่ด้วยน้ำเสียงและลีลาที่ดีกว่าเดิม ห้ามเพิ่มหรือตัดเนื้อหาหลักออก แต่ให้ปรับปรุงวิธีการเขียน:\n\n${text}`,
  expand: (text) =>
    `เพิ่มรายละเอียด บรรยากาศ และความลึกให้กับข้อความต่อไปนี้ ให้ยาวขึ้นประมาณ 2-3 เท่า:\n\n${text}`,
  'to-dialogue': (text) =>
    `แปลงข้อความต่อไปนี้เป็นบทสนทนาระหว่างตัวละคร รักษาความหมายและอารมณ์ไว้:\n\n${text}`,
  translate: (text) => {
    const hasThai = /[\u0E00-\u0E7F]/.test(text);
    return hasThai
      ? `Translate the following Thai text to English, maintaining literary quality:\n\n${text}`
      : `แปลข้อความภาษาอังกฤษต่อไปนี้เป็นภาษาไทยที่สวยงามและเป็นธรรมชาติ:\n\n${text}`;
  },
  custom: (text) => text, // prompt is passed directly
};

interface UseInlineAiOptions {
  novelId: string;
  episodeId?: string;
}

export function useInlineAi({ novelId, episodeId }: UseInlineAiOptions) {
  const [state, setState] = useState<InlineAiPhase>({ phase: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const triggerAction = useCallback(
    async (
      action: InlineAiAction,
      editor: Editor,
      customPrompt?: string, // used for 'custom' action
    ) => {
      const { from, to } = editor.state.selection;
      const originalText = editor.state.doc.textBetween(from, to, '\n');

      if (!originalText.trim() && action !== 'custom') return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState({ phase: 'generating', action, originalText, from, to });

      const promptText =
        action === 'custom' && customPrompt
          ? `${customPrompt}\n\nบริบท (ข้อความที่เคอร์เซอร์อยู่):\n${originalText || '[ไม่มีข้อความที่เลือก]'}`
          : ACTION_PROMPTS[action](originalText);

      let collectedText = '';

      try {
        await streamStoryGeneration(
          {
            novelId,
            ...(episodeId ? { episodeId } : {}),
            userMessage: promptText,
            temperature: 0.7,
          },
          (event) => {
            if (event.type === 'chunk') {
              collectedText += event.text;
              // Update preview while streaming so user sees progress
              setState({
                phase: 'preview',
                action,
                originalText,
                suggestedText: collectedText,
                from,
                to,
              });
            }
            if (event.type === 'done' || event.type === 'error') {
              // Already in preview state at this point
            }
          },
          abortRef.current.signal,
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setState({ phase: 'idle' });
          return;
        }
        setState({ phase: 'idle' });
      }
    },
    [novelId, episodeId],
  );

  const acceptSuggestion = useCallback(
    (editor: Editor) => {
      if (state.phase !== 'preview') return;
      const { from, to, suggestedText } = state;

      // Replace selected range with AI suggestion
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, suggestedText).run();

      setState({ phase: 'idle' });
    },
    [state],
  );

  const rejectSuggestion = useCallback(() => {
    abortRef.current?.abort();
    setState({ phase: 'idle' });
  }, []);

  return { state, triggerAction, acceptSuggestion, rejectSuggestion };
}
