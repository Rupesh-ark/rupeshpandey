import { useCallback } from 'react';

export function useScrollTo(): (id: string) => void {
  return useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.focus({ preventScroll: true });
    }
  }, []);
}
