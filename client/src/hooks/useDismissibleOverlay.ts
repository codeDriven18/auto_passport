import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { registerFloatingPanel, unregisterFloatingPanel } from '@/lib/floatingPanels';

interface UseDismissibleOverlayOptions {
  open: boolean;
  onClose: () => void;
  /** Root element — clicks inside (trigger + panel) do not dismiss. */
  containerRef: RefObject<HTMLElement | null>;
  /** Optional scrollable panel — scrolling inside does not dismiss. */
  panelRef?: RefObject<HTMLElement | null>;
  /** Unique id for single-panel coordination. */
  panelId?: string;
  /** Close when the route changes. Default true. */
  closeOnRouteChange?: boolean;
  closeOnScroll?: boolean;
}

function isInsideRef(ref: RefObject<HTMLElement | null> | undefined, target: EventTarget | null): boolean {
  if (!ref?.current || !target) return false;
  return ref.current.contains(target as Node);
}

/**
 * Standard dismiss behavior for dropdowns/overlays:
 * pointer down outside, Escape, route change, scroll outside panel, single-panel coordination.
 */
export function useDismissibleOverlay({
  open,
  onClose,
  containerRef,
  panelRef,
  panelId,
  closeOnRouteChange = true,
  closeOnScroll = true,
}: UseDismissibleOverlayOptions): void {
  const location = useLocation();

  useEffect(() => {
    if (!open) return;

    if (panelId) {
      registerFloatingPanel(panelId, onClose);
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = containerRef.current;
      if (!root) return;
      if (root.contains(event.target as Node)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    const onScroll = (event: Event) => {
      const target = event.target;
      if (isInsideRef(containerRef, target)) return;
      if (isInsideRef(panelRef, target)) return;
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
      if (panelId) {
        unregisterFloatingPanel(panelId);
      }
    };
  }, [open, onClose, containerRef, panelRef, panelId, closeOnScroll]);

  useEffect(() => {
    if (!open || !closeOnRouteChange) return;
    onClose();
  }, [location.pathname, location.search, location.hash]); // eslint-disable-line react-hooks/exhaustive-deps -- close on navigation only
}
