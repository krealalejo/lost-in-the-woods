import {
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { Item } from "../engine/types";

interface Props {
  item: Item;
  onClose: () => void;
}

export function ItemModal({ item, onClose }: Readonly<Props>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const closeFromBackdrop = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const closeFromKeyboard = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeFromBackdrop}
      onKeyDown={closeFromKeyboard}
    >
      <div className="modal-box" role="dialog" aria-modal="true">
        <span className="tag">{item.name.toUpperCase()}</span>
        <p className="modal-desc">{item.description}</p>
        <button className="modal-close" onClick={onClose}>
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
}
