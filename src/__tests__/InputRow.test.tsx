import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { InputRow, focusInputEl } from "../components/InputRow";

const noop = () => "";

function renderInputRow(
  props?: Partial<React.ComponentProps<typeof InputRow>>,
) {
  return render(
    <InputRow
      disabled={false}
      submitBlocked={false}
      onSubmit={vi.fn()}
      onHistoryPrev={noop}
      onHistoryNext={noop}
      {...props}
    />,
  );
}

describe("InputRow", () => {
  it("renders an input element", () => {
    renderInputRow();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("calls onSubmit with value on Enter", () => {
    const onSubmit = vi.fn();
    renderInputRow({ onSubmit });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "look" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("look");
  });

  it("clears input after submit", () => {
    renderInputRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "look" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });

  it("does not submit empty input", () => {
    const onSubmit = vi.fn();
    renderInputRow({ onSubmit });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit whitespace-only input", () => {
    const onSubmit = vi.fn();
    renderInputRow({ onSubmit });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when disabled", () => {
    const onSubmit = vi.fn();
    renderInputRow({ disabled: true, onSubmit });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "look" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ArrowUp sets value from historyPrev", () => {
    const onHistoryPrev = vi.fn().mockReturnValue("prev cmd");
    renderInputRow({ onHistoryPrev });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onHistoryPrev).toHaveBeenCalled();
    expect(input.value).toBe("prev cmd");
  });

  it("ArrowDown sets value from historyNext", () => {
    const onHistoryNext = vi.fn().mockReturnValue("next cmd");
    renderInputRow({ onHistoryNext });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onHistoryNext).toHaveBeenCalled();
    expect(input.value).toBe("next cmd");
  });

  it("clicking wrapper focuses input", () => {
    renderInputRow();
    const input = screen.getByRole("textbox");
    const wrapper = input.closest(".input-row")!;
    fireEvent.click(wrapper);
  });

  it("clicking directly on input does not double-focus", () => {
    renderInputRow();
    const input = screen.getByRole("textbox");
    fireEvent.click(input);
  });

  it("onKeyUp fires syncCursor on input", () => {
    renderInputRow();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.keyUp(input, { key: "c" });
  });

  it("global keydown appends char when input not focused", () => {
    renderInputRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.blur();
    fireEvent.keyDown(document, { key: "x" });
    expect(input.value).toBe("x");
  });

  it("global keydown backspace removes last char when not focused", () => {
    renderInputRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ab" } });
    input.blur();
    fireEvent.keyDown(document, { key: "Backspace" });
    expect(input.value).toBe("a");
  });

  it("global keydown does nothing when disabled", () => {
    renderInputRow({ disabled: true });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.blur();
    fireEvent.keyDown(document, { key: "x" });
    expect(input.value).toBe("");
  });

  it("global keydown does nothing when Ctrl held", () => {
    renderInputRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.blur();
    fireEvent.keyDown(document, { key: "c", ctrlKey: true });
    expect(input.value).toBe("");
  });

  it("global keydown does nothing when active element is a button", () => {
    const { container } = render(
      <div>
        <button>click</button>
        <InputRow
          disabled={false}
          submitBlocked={false}
          onSubmit={vi.fn()}
          onHistoryPrev={noop}
          onHistoryNext={noop}
        />
      </div>,
    );
    const btn = container.querySelector("button")!;
    btn.focus();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(document, { key: "x" });
    expect(input.value).toBe("");
  });

  it("non-special key on input does not trigger history or submit", () => {
    const onSubmit = vi.fn();
    renderInputRow({ onSubmit });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Tab" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("focusInputEl focuses ref element", () => {
    const ref = createRef<HTMLInputElement>();
    renderInputRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    (ref as { current: HTMLInputElement }).current = input;
    focusInputEl(ref);
    expect(document.activeElement).toBe(input);
  });
});
