import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CRTScreen } from "../components/CRTScreen";
import { HUD } from "../components/HUD";
import { MapPanel } from "../components/MapPanel";
import { TouchPad } from "../components/TouchPad";

describe("CRTScreen", () => {
  it("renders children", () => {
    render(
      <CRTScreen doom={false}>
        <span>test</span>
      </CRTScreen>,
    );
    expect(screen.getByText("test")).toBeTruthy();
  });

  it("adds doom class when doom=true", () => {
    const { container } = render(
      <CRTScreen doom={true}>
        <span />
      </CRTScreen>,
    );
    expect(container.querySelector(".crt.doom")).toBeTruthy();
  });

  it("no doom class when doom=false", () => {
    const { container } = render(
      <CRTScreen doom={false}>
        <span />
      </CRTScreen>,
    );
    expect(container.querySelector(".doom")).toBeNull();
    expect(container.querySelector(".crt")).toBeTruthy();
  });
});

describe("HUD", () => {
  it("renders location uppercased", () => {
    render(<HUD location="forest" turns={0} />);
    expect(screen.getByText(/FOREST/)).toBeTruthy();
  });

  it("renders turns zero-padded to 4 digits", () => {
    render(<HUD location="house" turns={7} />);
    expect(screen.getByText(/0007/)).toBeTruthy();
  });
});

describe("MapPanel", () => {
  it("renders map HTML", () => {
    const { container } = render(<MapPanel mapHtml="<b>map</b>" />);
    expect(container.querySelector(".map")!.innerHTML).toBe("<b>map</b>");
  });

  it("renders compass text", () => {
    render(<MapPanel mapHtml="" />);
    expect(screen.getByText(/N/)).toBeTruthy();
  });
});

describe("TouchPad", () => {
  it("renders all direction buttons", () => {
    render(<TouchPad disabled={false} onCommand={vi.fn()} />);
    expect(screen.getByText("N")).toBeTruthy();
    expect(screen.getByText("S")).toBeTruthy();
    expect(screen.getByText("E")).toBeTruthy();
    expect(screen.getByText("W")).toBeTruthy();
  });

  it("calls onCommand with correct cmd on click", () => {
    const onCommand = vi.fn();
    render(<TouchPad disabled={false} onCommand={onCommand} />);
    fireEvent.click(screen.getByText("LOOK"));
    expect(onCommand).toHaveBeenCalledWith("look");
  });

  it("disables buttons when disabled=true", () => {
    render(<TouchPad disabled={true} onCommand={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
