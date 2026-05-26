import { useEffect } from "react";
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="tag">{item.name.toUpperCase()}</span>
        <p className="modal-desc">{item.description}</p>
        <button className="modal-close" onClick={onClose}>
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
}
