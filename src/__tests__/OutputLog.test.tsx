import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OutputLog } from "../components/OutputLog";
import type { OutputLine } from "../engine/types";

describe("OutputLog", () => {
  it("renders empty container", () => {
    const { container } = render(<OutputLog lines={[]} />);
    expect(container.querySelectorAll(".line")).toHaveLength(0);
  });

  it("renders lines with text", () => {
    const lines: OutputLine[] = [
      { id: 0, text: "hello", typing: false },
      { id: 1, text: "world", typing: false },
    ];
    render(<OutputLog lines={lines} />);
    expect(screen.getByText("hello")).toBeTruthy();
    expect(screen.getByText("world")).toBeTruthy();
  });

  it("applies cls as class on line div", () => {
    const lines: OutputLine[] = [
      { id: 0, text: "bad", cls: "bad", typing: false },
    ];
    const { container } = render(<OutputLog lines={lines} />);
    expect(container.querySelector(".line.bad")).toBeTruthy();
  });

  it("shows type-caret when typing", () => {
    const lines: OutputLine[] = [{ id: 0, text: "...", typing: true }];
    const { container } = render(<OutputLog lines={lines} />);
    expect(container.querySelector(".type-caret")).toBeTruthy();
  });

  it("no caret when not typing", () => {
    const lines: OutputLine[] = [{ id: 0, text: "done", typing: false }];
    const { container } = render(<OutputLog lines={lines} />);
    expect(container.querySelector(".type-caret")).toBeNull();
  });

  it("applies typing class when line is typing", () => {
    const lines: OutputLine[] = [{ id: 0, text: "", typing: true }];
    const { container } = render(<OutputLog lines={lines} />);
    expect(container.querySelector(".line.typing")).toBeTruthy();
  });

  it("no typing class when not typing", () => {
    const lines: OutputLine[] = [{ id: 0, text: "done", typing: false }];
    const { container } = render(<OutputLog lines={lines} />);
    expect(container.querySelector(".line.typing")).toBeNull();
  });

  it("renders multiple lines in order", () => {
    const lines: OutputLine[] = [
      { id: 0, text: "first", typing: false },
      { id: 1, text: "second", typing: false },
      { id: 2, text: "third", typing: false },
    ];
    const { container } = render(<OutputLog lines={lines} />);
    const divs = container.querySelectorAll(".line");
    expect(divs).toHaveLength(3);
    expect(divs[0].textContent).toBe("first");
    expect(divs[2].textContent).toBe("third");
  });
});
