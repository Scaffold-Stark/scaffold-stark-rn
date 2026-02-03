import { renderHook } from "@testing-library/react-native";
import { useNativeCurrencyPrice } from "../useNativeCurrencyPrice";

// Mock the store
jest.mock("@/stores/store", () => ({
  useGlobalState: jest.fn(() => jest.fn()),
}));

// Mock the price service
jest.mock("@/services/web3/PriceService", () => ({
  priceService: {
    getNextId: jest.fn(() => 123),
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
  },
}));

describe("useNativeCurrencyPrice", () => {
  const mockSetNativeCurrencyPrice = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup store mock to return the setter
    const { useGlobalState } = require("@/stores/store");
    useGlobalState.mockImplementation(() => mockSetNativeCurrencyPrice);
  });

  it("should start polling on mount", () => {
    const { priceService } = require("@/services/web3/PriceService");

    renderHook(() => useNativeCurrencyPrice());

    expect(priceService.getNextId).toHaveBeenCalled();
    expect(priceService.startPolling).toHaveBeenCalledWith(
      "123",
      mockSetNativeCurrencyPrice,
    );
  });

  it("should stop polling on unmount", () => {
    const { priceService } = require("@/services/web3/PriceService");

    const { unmount } = renderHook(() => useNativeCurrencyPrice());
    unmount();

    expect(priceService.stopPolling).toHaveBeenCalledWith("123");
  });

  it("should not throw errors", () => {
    expect(() => {
      renderHook(() => useNativeCurrencyPrice());
    }).not.toThrow();
  });
});
