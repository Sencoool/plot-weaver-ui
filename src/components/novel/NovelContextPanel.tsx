import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Input';
import type { Character } from '../../types/novel';

interface NovelContextPanelProps {
  plotOutline: string;
  writingStyle: string;
  worldSetting: string;
  characters: Character[];
  onPlotOutlineChange: (v: string) => void;
  onWritingStyleChange: (v: string) => void;
  onWorldSettingChange: (v: string) => void;
  onCharactersChange: (chars: Character[]) => void;
  onSave: () => void;
  isSaving?: boolean;
  defaultOpen?: boolean;
}

export function NovelContextPanel({
  plotOutline,
  writingStyle,
  worldSetting,
  characters,
  onPlotOutlineChange,
  onWritingStyleChange,
  onWorldSettingChange,
  onCharactersChange,
  onSave,
  isSaving = false,
  defaultOpen = false,
}: NovelContextPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  const addCharacter = () =>
    onCharactersChange([...characters, { name: '', role: 'other', description: '' }]);

  const removeCharacter = (i: number) =>
    onCharactersChange(characters.filter((_, j) => j !== i));

  const updateCharacter = (i: number, patch: Partial<Character>) => {
    const updated = [...characters];
    updated[i] = { ...updated[i], ...patch };
    onCharactersChange(updated);
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        id="lore-toggle"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1.25rem 2rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          fontWeight: 700,
          fontSize: '1rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🧠 AI Story Context
          <Badge variant="purple">Used by AI when writing</Badge>
        </span>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {open && (
        <div
          style={{
            padding: '0 2rem 2rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            This context is used by the AI when generating content. The more detail you provide, the better the AI understands your world.
          </p>

          <Textarea
            label="Plot Outline"
            id="lore-plot"
            value={plotOutline}
            onChange={(e) => onPlotOutlineChange(e.target.value)}
            placeholder="Main story arc, key events, turning points…"
            rows={4}
            hint="Max 5,000 characters"
          />

          <Textarea
            label="Writing Style"
            id="lore-style"
            value={writingStyle}
            onChange={(e) => onWritingStyleChange(e.target.value)}
            placeholder="E.g., third-person omniscient, literary fiction, dark and suspenseful…"
            rows={3}
            hint="Max 1,000 characters"
          />

          <Input
            label="World Setting"
            id="lore-world"
            value={worldSetting}
            onChange={(e) => onWorldSettingChange(e.target.value)}
            placeholder="E.g., medieval fantasy kingdom, futuristic cyberpunk city 2187…"
          />

          {/* Characters */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Characters
              </label>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={addCharacter}
                id="add-character-btn"
              >
                Add Character
              </Button>
            </div>

            {characters.length === 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No characters defined yet. Add your main characters so the AI knows who they are.
              </p>
            )}

            {characters.map((char, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '0.625rem',
                  alignItems: 'flex-start',
                }}
              >
                <Input
                  placeholder="Name"
                  value={char.name}
                  onChange={(e) => updateCharacter(i, { name: e.target.value })}
                  style={{ flex: 1 }}
                />
                <select
                  value={char.role}
                  onChange={(e) =>
                    updateCharacter(i, { role: e.target.value as Character['role'] })
                  }
                  className="input"
                  style={{ width: '140px', flexShrink: 0 }}
                >
                  <option value="protagonist">Protagonist</option>
                  <option value="antagonist">Antagonist</option>
                  <option value="supporting">Supporting</option>
                  <option value="other">Other</option>
                </select>
                <Input
                  placeholder="Brief description…"
                  value={char.description ?? ''}
                  onChange={(e) => updateCharacter(i, { description: e.target.value })}
                  style={{ flex: 2 }}
                />
                <button
                  onClick={() => removeCharacter(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                  aria-label="Remove character"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="ai"
              onClick={onSave}
              loading={isSaving}
              id="save-lore-btn"
            >
              Save Context
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
