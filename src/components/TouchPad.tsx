interface Props {
  disabled: boolean;
  onCommand: (cmd: string) => void;
}

const BUTTONS = [
  { label: "N", cmd: "north" },
  { label: "W", cmd: "west" },
  { label: "E", cmd: "east" },
  { label: "S", cmd: "south" },
  { label: "LOOK", cmd: "look" },
  { label: "TAKE", cmd: "take keys" },
  { label: "OPEN", cmd: "open door" },
  { label: "INV", cmd: "inventory" },
  { label: "WAIT", cmd: "wait" },
  { label: "HELP", cmd: "help" },
] as const;

export function TouchPad({ disabled, onCommand }: Props) {
  return (
    <div className="touchpad" aria-label="quick commands">
      {BUTTONS.map(({ label, cmd }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onCommand(cmd)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
