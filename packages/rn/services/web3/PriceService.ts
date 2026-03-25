import scaffoldConfig from "@/scaffold.config";

const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=starknet&vs_currencies=usd";

/**
 * Fetches the current STRK price from CoinGecko API.
 */
export const fetchPrice = async (retries = 3): Promise<number> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(COINGECKO_API_URL);
      const data = await response.json();
      return data.starknet?.usd ?? 0;
    } catch (error) {
      console.error(
        `[PriceService] Attempt ${attempt + 1} - Error fetching STRK price:`,
        error,
      );
      attempt++;
      if (attempt === retries) {
        console.error(
          `[PriceService] Failed to fetch price after ${retries} attempts.`,
        );
        return 0;
      }
    }
  }
  return 0;
};

type Listener = {
  setNativeCurrencyPrice: (price: number) => void;
};

class PriceService {
  private static instance: PriceService;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Listener> = new Map();
  private currentNativeCurrencyPrice: number = 0;
  private idCounter: number = 0;

  private constructor() {}

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  public getNextId(): number {
    return ++this.idCounter;
  }

  public startPolling(
    ref: string,
    setNativeCurrencyPrice: (price: number) => void,
  ) {
    if (this.listeners.has(ref)) return;
    this.listeners.set(ref, { setNativeCurrencyPrice });

    if (this.intervalId) {
      setNativeCurrencyPrice(this.currentNativeCurrencyPrice);
      return;
    }

    this.fetchPrices();
    this.intervalId = setInterval(() => {
      this.fetchPrices();
    }, scaffoldConfig.pollingInterval);
  }

  public stopPolling(ref: string) {
    if (!this.intervalId) return;
    if (!this.listeners.has(ref)) return;

    this.listeners.delete(ref);
    if (this.listeners.size === 0) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getCurrentNativeCurrencyPrice(): number {
    return this.currentNativeCurrencyPrice;
  }

  private async fetchPrices() {
    try {
      const strkPrice = await fetchPrice();
      if (strkPrice) {
        this.currentNativeCurrencyPrice = strkPrice;
      }
      this.listeners.forEach((listener) => {
        listener.setNativeCurrencyPrice(
          strkPrice || this.currentNativeCurrencyPrice,
        );
      });
    } catch (error) {
      console.error("[PriceService] Error fetching prices:", error);
    }
  }
}

export const priceService = PriceService.getInstance();
