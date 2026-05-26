import { useEffect, useRef } from "react";
import type { OutputLine } from "../engine/types";

interface Props {
  lines: OutputLine[];
}

export function OutputLog({ lines }: Readonly<Props>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* istanbul ignore next */
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="out-wrap" ref={ref}>
      {lines.map((line) => (
        <div
          key={line.id}
          className={["line", line.cls, line.typing ? "typing" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {line.text}
          {line.typing && <span className="type-caret" />}
        </div>
      ))}
    </div>
  );
}
