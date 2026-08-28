import { useState, useLayoutEffect } from "react";

export const useMediaQuery = (query: string) => {
  const [isMatch, setIsMatch] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useLayoutEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setIsMatch(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return isMatch;
};
