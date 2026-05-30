import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BackpackPanel } from "../components/BackpackPanel";
import { CRTScreen } from "../components/CRTScreen";
import { Hud } from "../components/HUD";
import { ItemModal } from "../components/ItemModal";
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

const hudProps = {
  stories: [
    {
      id: "test",
      title: "TEST STORY",
      version: "v0.1",
      initialState: () => ({
        location: "",
        inventory: [],
        flags: {},
        turns: 0,
        ended: null,
      }),
      getIntro: () => [],
      getMap: () => "",
      parse: (r: string) => ({ verb: null, noun: null, raw: r }),
      handle: () => [],
    },
  ],
  activeStoryId: "test",
  onStoryChange: () => {},
};

describe("HUD", () => {
  it("renders location uppercased", () => {
    render(<Hud location="forest" turns={0} {...hudProps} />);
    expect(screen.getByText(/FOREST/)).toBeTruthy();
  });

  it("renders turns zero-padded to 4 digits", () => {
    render(<Hud location="house" turns={7} {...hudProps} />);
    expect(screen.getByText(/0007/)).toBeTruthy();
  });
});

describe("MapPanel", () => {
  it("renders map HTML after scan animation completes", () => {
    vi.useFakeTimers();
    const { container } = render(<MapPanel mapHtml="<b>map</b>" />);
    act(() => {
      vi.runAllTimers();
    });
    expect(container.querySelector(".map")!.innerHTML).toBe("<b>map</b>");
    vi.useRealTimers();
  });

  it("does not render compass span", () => {
    const { container } = render(<MapPanel mapHtml="" />);
    expect(container.querySelector(".compass")).toBeNull();
  });

  it("does not render tag span", () => {
    const { container } = render(<MapPanel mapHtml="" />);
    expect(container.querySelector(".tag")).toBeNull();
  });

  it("reveals lines incrementally and stays animating mid-scan", () => {
    vi.useFakeTimers();
    const multiLine = "a\nb\nc\nd\ne\nf";
    const { container } = render(<MapPanel mapHtml={multiLine} />);
    const wrap = container.querySelector(".map-wrap") as HTMLElement;
    expect(wrap.style.alignItems).toBe("flex-start");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(wrap.style.alignItems).toBe("flex-start");
    vi.useRealTimers();
  });
});

describe("BackpackPanel", () => {
  it("shows empty message when no items", () => {
    const { container } = render(
      <BackpackPanel items={[]} onItemClick={vi.fn()} />,
    );
    expect(container.querySelector(".backpack-empty")).toBeTruthy();
  });

  it("renders item names", () => {
    const items = [{ name: "flashlight", description: "a light" }];
    render(<BackpackPanel items={items} onItemClick={vi.fn()} />);
    expect(screen.getByText(/flashlight/)).toBeTruthy();
  });

  it("calls onItemClick when item clicked", () => {
    const onItemClick = vi.fn();
    const item = { name: "flashlight", description: "a light" };
    render(<BackpackPanel items={[item]} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onItemClick).toHaveBeenCalledWith(item);
  });

  it("calls onItemClick on Enter keydown", () => {
    const onItemClick = vi.fn();
    const item = { name: "flashlight", description: "" };
    render(<BackpackPanel items={[item]} onItemClick={onItemClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onItemClick).toHaveBeenCalledWith(item);
  });

  it("does not call onItemClick on non-Enter keydown", () => {
    const onItemClick = vi.fn();
    const item = { name: "flashlight", description: "" };
    render(<BackpackPanel items={[item]} onItemClick={onItemClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Space" });
    expect(onItemClick).not.toHaveBeenCalled();
  });
});

describe("ItemModal", () => {
  const item = { name: "flashlight", description: "A small light." };

  it("renders item name uppercased and description", () => {
    render(<ItemModal item={item} onClose={vi.fn()} />);
    expect(screen.getByText("FLASHLIGHT")).toBeTruthy();
    expect(screen.getByText("A small light.")).toBeTruthy();
  });

  it("calls onClose when Escape pressed", () => {
    const onClose = vi.fn();
    render(<ItemModal item={item} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose on other keys", () => {
    const onClose = vi.fn();
    render(<ItemModal item={item} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when overlay clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<ItemModal item={item} onClose={onClose} />);
    fireEvent.click(container.querySelector(".modal-overlay")!);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when modal-box clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<ItemModal item={item} onClose={onClose} />);
    fireEvent.click(container.querySelector(".modal-box")!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ItemModal item={item} onClose={onClose} />);
    fireEvent.click(screen.getByText("[ CLOSE ]"));
    expect(onClose).toHaveBeenCalled();
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
