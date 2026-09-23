"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input, Select } from "@/components/admin/ui/field";
import { MAX_BUTTONS, type NoticeButton } from "@/lib/site-content";

// Shared by the notice builder and the conference editor.
export function ButtonsEditor({
  value,
  onChange,
}: {
  value: NoticeButton[];
  onChange: (next: NoticeButton[]) => void;
}) {
  function update(i: number, patch: Partial<NoticeButton>) {
    onChange(value.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  }

  function move(i: number, j: number) {
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Pulsanti</span>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-400">
          Nessun pulsante. Sono facoltativi.
        </p>
      )}

      {value.map((b, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center">
          <Input
            value={b.label}
            placeholder="Testo, es. Iscriviti"
            maxLength={40}
            onChange={(e) => update(i, { label: e.target.value })}
            className="sm:w-44"
          />
          <Input
            value={b.url}
            placeholder="https://... oppure /dispense"
            onChange={(e) => update(i, { url: e.target.value })}
            className="min-w-0 flex-1"
          />
          <Select
            value={b.style}
            onChange={(e) => update(i, { style: e.target.value as NoticeButton["style"] })}
            className="sm:w-36"
          >
            <option value="primary">Pieno</option>
            <option value="secondary">Contorno</option>
          </Select>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton label="Sposta su" disabled={i === 0} onClick={() => move(i, i - 1)}>
              <ArrowUp className="h-4 w-4" />
            </IconButton>
            <IconButton label="Sposta giù" disabled={i === value.length - 1} onClick={() => move(i, i + 1)}>
              <ArrowDown className="h-4 w-4" />
            </IconButton>
            <IconButton label="Rimuovi" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      ))}

      {value.length < MAX_BUTTONS && (
        <Button
          variant="secondary"
          className="self-start"
          onClick={() => onChange([...value, { label: "", url: "", style: value.length ? "secondary" : "primary" }])}
        >
          <Plus className="h-4 w-4" />
          Aggiungi pulsante
        </Button>
      )}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
