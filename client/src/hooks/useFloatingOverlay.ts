import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { registerFloatingPanel, unregisterFloatingPanel } from '@/lib/floatingPanels';

interface UseFloatingOverlayOptions {
  open: boolean;
  onClose: () => void;
  panelId: string;
  panelRef?: RefObject<HTMLElement | null>;
  closeOnRouteChange?: boolean;
  closeOnScroll?: boolean;
}

function isInsideRef(ref: RefObject<HTMLElement | null> | undefined, target: EventTarget | null): boolean {
  if (!ref?.current || !target) return false;
  return ref.current.contains(target as Node);
}

/**
 * Single-overlay dismiss: outside tap, Escape, route change, scroll outside panel, panel coordination.
 */
export function useFloatingOverlay({
  open,
  onClose,
  panelId,
  panelRef,
  closeOnRouteChange = true,
  closeOnScroll = true,
}: UseFloatingOverlayOptions): void {
  const location = useLocation();

  useEffect(() => {
    if (!open) return;

    registerFloatingPanel(panelId, onClose);

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef?.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    const onScroll = (event: Event) => {
      if (isInsideRef(panelRef, event.target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    if (closeOnScroll) {
      document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    }

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      if (closeOnScroll) {
        document.removeEventListener('scroll', onScroll, true);
      }
      unregisterFloatingPanel(panelId);
    };
  }, [open, onClose, panelId, panelRef, closeOnScroll]);

  useEffect(() => {
    if (!open || !closeOnRouteChange) return;
    onClose();
  }, [location.pathname, location.search, location.hash]); // eslint-disable-line react-hooks/exhaustive-deps
}
