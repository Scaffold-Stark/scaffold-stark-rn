import { renderHook, act } from "@testing-library/react-native";
import { useAnimationConfig } from "../useAnimationConfig";

describe("useAnimationConfig", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns showAnimation as false initially", () => {
    const { result } = renderHook(() => useAnimationConfig("initial"));
    expect(result.current.showAnimation).toBe(false);
  });

  it("sets showAnimation to true when data changes", () => {
    const { result, rerender } = renderHook(
      ({ data }) => useAnimationConfig(data),
      { initialProps: { data: "initial" } },
    );

    expect(result.current.showAnimation).toBe(false);

    rerender({ data: "changed" });
    expect(result.current.showAnimation).toBe(true);
  });

  it("resets showAnimation to false after ANIMATION_TIME", () => {
    const { result, rerender } = renderHook(
      ({ data }) => useAnimationConfig(data),
      { initialProps: { data: "initial" } },
    );

    rerender({ data: "changed" });
    expect(result.current.showAnimation).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.showAnimation).toBe(false);
  });

  it("does not trigger animation on first render with undefined prevData", () => {
    const { result } = renderHook(() => useAnimationConfig("test"));
    expect(result.current.showAnimation).toBe(false);
  });
});
