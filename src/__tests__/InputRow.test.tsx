import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputRow } from "../components/InputRow";

const noop = () => "";

describe("InputRow", () => {
  it("renders an input element", () => {
    render(
      <InputRow
        disabled={false}
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
        onSubmit={vi.fn()}
        onHistoryPrev={noop}
        onHistoryNext={noop}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.click(input);
  });
});
