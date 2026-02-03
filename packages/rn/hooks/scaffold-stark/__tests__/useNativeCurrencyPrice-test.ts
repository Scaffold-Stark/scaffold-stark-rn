import { renderHook } from "@testing-library/react-native";
import { useNativeCurrencyPrice } from "../useNativeCurrencyPrice";

const mockStartPolling = jest.fn();
const mockStopPolling = jest.fn();
const mockGetNextId = jest.fn(() => 1);

jest.mock("@/services/web3/PriceService", () => ({
  priceService: {
    startPolling: mockStartPolling,
    stopPolling: mockStopPolling,
    getNextId: mockGetNextId,
  },
}));

const mockSetNativeCurrencyPrice = jest.fn();

jest.mock("@/stores/store", () => ({
  useGlobalState: jest.fn((selector) =>
    selector({
      setNativeCurrencyPrice: mockSetNativeCurrencyPrice,
    }),
  ),
}));

describe("useNativeCurrencyPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts polling on mount", () => {
    renderHook(() => useNativeCurrencyPrice());

    expect(mockStartPolling).toHaveBeenCalledWith(
      "1",
      mockSetNativeCurrencyPrice,
    );
  });

  it("stops polling on unmount", () => {
    const { unmount } = renderHook(() => useNativeCurrencyPrice());

    unmount();

    expect(mockStopPolling).toHaveBeenCalledWith("1");
  });

  it("gets a unique ID for polling", () => {
    renderHook(() => useNativeCurrencyPrice());

    expect(mockGetNextId).toHaveBeenCalled();
  });
});
