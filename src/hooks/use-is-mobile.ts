import { useMediaQuery } from "@heroui/react";

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)", {
    defaultValue: false,
    initializeWithValue: false,
  });
}
