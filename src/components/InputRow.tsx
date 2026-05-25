import { useCallback, useState } from "react";

interface Props {
  disabled: boolean;
  onSubmit: (value: string) => void;
  onHistoryPrev: () => string;
  onHistoryNext: () => string;
}

export function InputRow({
  disabled,
  onSubmit,
  onHistoryPrev,
  onHistoryNext,
}: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSubmit(value);
    setValue("");
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setValue(onHistoryPrev());
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setValue(onHistoryNext());
      }
    },
    [handleSubmit, onHistoryPrev, onHistoryNext],
  );

  return (
    <label className="input-row">
      <span className="prompt">&gt;</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        inputMode="text"
        enterKeyHint="send"
        aria-label="command"
      />
      <span className="cursor" />
    </label>
  );
}

export function focusInputEl(ref: React.RefObject<HTMLInputElement | null>) {
  ref.current?.focus();
}
