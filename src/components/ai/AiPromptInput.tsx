import { useState } from 'react';
import { Wand2, Square, Sliders } from 'lucide-react';
import { useAiStore } from '../../store/aiStore';
import { useAiGeneration } from '../../hooks/useAiGeneration';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import type { Editor } from '@tiptap/react';

interface AiPromptInputProps {
  novelId: string;
  episodeId?: string;
  editor: Editor | null;
}

const QUICK_PROMPTS = [
  'Continue the story from where it left off',
  'Write a tense confrontation scene',
  'Add descriptive atmosphere and setting details',
  'Write natural dialogue between characters',
];

export function AiPromptInput({ novelId, episodeId, editor }: AiPromptInputProps) {
  const {
    prompt,
    targetChars,
    temperature,
    status,
    setPrompt,
    setTargetChars,
    setTemperature,
  } = useAiStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const getEditorContent = () => editor?.getHTML() ?? '';

  const { generate, cancel } = useAiGeneration(novelId, episodeId, getEditorContent);

  const isRunning = status === 'generating' || status === 'streaming';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Quick prompts */}
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Quick Prompts
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp}
              onClick={() => setPrompt(qp)}
              disabled={isRunning}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: prompt === qp ? 'var(--color-surface)' : 'transparent',
                color: prompt === qp ? 'var(--color-blue-600)' : 'var(--color-text-secondary)',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt textarea */}
      <Textarea
        label="Your instruction"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="E.g., Write a dramatic reveal scene where the hero discovers the truth about their mentor…"
        rows={5}
        disabled={isRunning}
        id="ai-prompt-textarea"
      />

      {/* Target length slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Target Length
          </label>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-blue-600)', fontWeight: 600 }}>
            {targetChars >= 1000 ? `${(targetChars / 1000).toFixed(1)}k` : targetChars} chars
            {targetChars > 2500 && (
              <span style={{ color: 'var(--color-purple-500)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                (segmented)
              </span>
            )}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={15000}
          step={500}
          value={targetChars}
          onChange={(e) => setTargetChars(Number(e.target.value))}
          disabled={isRunning}
          aria-label="Target character count"
          style={{ width: '100%', accentColor: 'var(--color-blue-600)' }}
          id="ai-target-chars"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
          <span>500</span>
          <span>2.5k (single-shot)</span>
          <span>15k</span>
        </div>
      </div>

      {/* Advanced settings toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Sliders size={13} />
        Advanced settings
      </button>

      {showAdvanced && (
        <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Temperature (creativity)
            </label>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-blue-600)', fontWeight: 600 }}>
              {temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            disabled={isRunning}
            aria-label="AI temperature"
            style={{ width: '100%', accentColor: 'var(--color-blue-600)' }}
            id="ai-temperature"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
      )}

      {/* Generate / Cancel button */}
      {isRunning ? (
        <Button
          variant="danger"
          leftIcon={<Square size={15} />}
          onClick={cancel}
          id="ai-cancel-btn"
        >
          Cancel Generation
        </Button>
      ) : (
        <Button
          variant="ai"
          leftIcon={<Wand2 size={15} />}
          onClick={generate}
          disabled={!prompt.trim() || !novelId}
          id="ai-generate-btn"
        >
          Generate with AI
        </Button>
      )}
    </div>
  );
}

