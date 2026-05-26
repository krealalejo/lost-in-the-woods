import type { Item } from "../engine/types";

interface Props {
  items: Item[];
  onItemClick: (item: Item) => void;
}

export function BackpackPanel({ items, onItemClick }: Readonly<Props>) {
  return (
    <div className="backpack-wrap">
      <span className="tag">BACKPACK</span>
      <ul className="backpack-list">
        {items.length === 0 ? (
          <li className="backpack-empty">— empty —</li>
        ) : (
          items.map((item) => (
            <li
              key={item.name}
              className="backpack-item"
              role="button"
              tabIndex={0}
              onClick={() => onItemClick(item)}
              onKeyDown={(e) => e.key === "Enter" && onItemClick(item)}
            >
              <span className="backpack-bullet">&gt;</span> {item.name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
