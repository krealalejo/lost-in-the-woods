import { useEffect, type MouseEvent as ReactMouseEvent } from "react";
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
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [onClose]);

  const closeFromBackdrop = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={closeFromBackdrop}
    >
      <dialog className="modal-box" open aria-modal="true">
        <span className="tag">{item.name.toUpperCase()}</span>
        <p className="modal-desc">{item.description}</p>
        <button className="modal-close" onClick={onClose}>
          [ CLOSE ]
        </button>
      </dialog>
    </div>
  );
}
