import type { ReactNode } from "react";

interface Props {
  doom: boolean;
  children: ReactNode;
}

export function CRTScreen({ doom, children }: Readonly<Props>) {
  return (
    <div className={`crt${doom ? " doom" : ""}`}>
      <div className="screen">{children}</div>
    </div>
  );
}
