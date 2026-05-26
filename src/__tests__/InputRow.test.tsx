import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { InputRow, focusInputEl } from "../components/InputRow";

const noop = () => "";

describe("InputRow", () => {
  it("renders an input element", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("calls onSubmit with value on Enter", () => {
    const onSubmit = vi.fn();
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={onSubmit}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "look" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("look");
  });

  it("clears input after submit", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "look" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });

  it("does not submit empty input", () => {
    const onSubmit = vi.fn();
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={onSubmit}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit whitespace-only input", () => {
    const onSubmit = vi.fn();
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={onSubmit}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when disabled", () => {
    const onSubmit = vi.fn();
    render(
      <InputRow
        disabled={true}
        submitBlocked={false}
        onSubmit={onSubmit}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "look" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ArrowUp sets value from historyPrev", () => {
    const onHistoryPrev = vi.fn().mockReturnValue("prev cmd");
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={onHistoryPrev}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onHistoryPrev).toHaveBeenCalled();
    expect(input.value).toBe("prev cmd");
  });

  it("ArrowDown sets value from historyNext", () => {
    const onHistoryNext = vi.fn().mockReturnValue("next cmd");
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={onHistoryNext}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onHistoryNext).toHaveBeenCalled();
    expect(input.value).toBe("next cmd");
  });

  it("clicking wrapper focuses input", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    const wrapper = input.closest(".input-row")!;
    fireEvent.click(wrapper);
  });

  it("clicking directly on input does not double-focus", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.click(input);
  });

  it("onKeyUp fires syncCursor on input", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.keyUp(input, { key: "c" });
  });

  it("global keydown appends char when input not focused", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.blur();
    fireEvent.keyDown(document, { key: "x" });
    expect(input.value).toBe("x");
  });

  it("global keydown backspace removes last char when not focused", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ab" } });
    input.blur();
    fireEvent.keyDown(document, { key: "Backspace" });
    expect(input.value).toBe("a");
  });

  it("global keydown does nothing when disabled", () => {
    render(
      <InputRow
        disabled={true}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.blur();
    fireEvent.keyDown(document, { key: "x" });
    expect(input.value).toBe("");
  });

  it("global keydown does nothing when Ctrl held", () => {
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
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
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={onSubmit}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Tab" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("focusInputEl focuses ref element", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <InputRow
        disabled={false}
        submitBlocked={false}
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    (ref as React.MutableRefObject<HTMLInputElement>).current = input;
    focusInputEl(ref);
    expect(document.activeElement).toBe(input);
  });
});
