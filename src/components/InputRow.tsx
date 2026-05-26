import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  disabled: boolean;
  submitBlocked: boolean;
  onSubmit: (value: string) => void;
  onHistoryPrev: () => string;
  onHistoryNext: () => string;
}

export function InputRow({
  disabled,
  submitBlocked,
  onSubmit,
  onHistoryPrev,
  onHistoryNext,
}: Readonly<Props>) {
  const [value, setValue] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (document.activeElement === inputRef.current) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
        setValue((prev) => prev + e.key);
        setCursorPos((prev) => prev + 1);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        inputRef.current?.focus();
        setValue((prev) => prev.slice(0, -1));
        setCursorPos((prev) => Math.max(0, prev - 1));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [disabled]);

  const syncCursor = useCallback((el: HTMLInputElement) => {
    /* istanbul ignore next */
    setCursorPos(el.selectionStart ?? el.value.length);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled || submitBlocked) return;
    onSubmit(value);
    setValue("");
    setCursorPos(0);
  }, [value, disabled, submitBlocked, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = onHistoryPrev();
        setValue(next);
        setCursorPos(next.length);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = onHistoryNext();
        setValue(next);
        setCursorPos(next.length);
      }
    },
    [handleSubmit, onHistoryPrev, onHistoryNext],
  );

  return (
    <label className="input-row">
      <span className="prompt">&gt;</span>
      <div className="input-wrapper">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            syncCursor(e.target);
          }}
          onKeyUp={(e) => syncCursor(e.currentTarget)}
          onClick={(e) => syncCursor(e.currentTarget)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={disabled}
          aria-busy={submitBlocked}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          inputMode="text"
          enterKeyHint="send"
          aria-label="command"
        />
        <span className="cursor" style={{ left: `${cursorPos}ch` }} />
      </div>
    </label>
  );
}

export function focusInputEl(ref: React.RefObject<HTMLInputElement | null>) {
  ref.current?.focus();
}
