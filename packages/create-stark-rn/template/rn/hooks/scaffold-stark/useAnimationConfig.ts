import { useEffect, useState } from "react";

const ANIMATION_TIME = 2000;

/**
 * Tracks changes in data and provides animation state for UI feedback when data updates.
 * When the input data changes, this hook returns true for showAnimation for a brief period
 * to allow UI components to display visual feedback (like highlighting or pulsing effects).
 *
 * @param data - The data value to track for changes. Can be any type.
 * @returns {Object} An object containing:
 *   - showAnimation: boolean - Boolean indicating if the animation should be shown (true when data has changed, false after animation period)
 */
export function useAnimationConfig(data: unknown) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [prevData, setPrevData] = useState<unknown>();

  useEffect(() => {
    if (prevData !== undefined && prevData !== data) {
      setShowAnimation(true);
      const timeout = setTimeout(() => setShowAnimation(false), ANIMATION_TIME);
      return () => clearTimeout(timeout);
    }
    setPrevData(data);
  }, [data, prevData]);

  return {
    showAnimation,
  };
}
