import { useState, useLayoutEffect, RefObject } from "react";

interface Size {
  width: number;
  height: number;
}

export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Initialize size on mount
    setSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Observe size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.borderBoxSize) {
          // Accurate tracking utilizing the border-box model
          const boxSize = entry.borderBoxSize[0];
          setSize({
            width: boxSize.inlineSize,
            height: boxSize.blockSize,
          });
        } else {
          // Fallback for older browser structures
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(element);

    // Clean up observer on unmount to avoid memory leaks
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}
