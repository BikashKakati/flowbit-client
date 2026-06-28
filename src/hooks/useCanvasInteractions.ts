import { useCallback, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useEditorStore } from '../store/editor-store';
import { sidebarTools } from '../constant';

export function useCanvasInteractions() {
  const { 
    activeTool, 
    drawingArrowFrom, 
    anchorNodeDetails,
    initializeArrowFromExternal,
    startFreehandDraw,
    updateFreehandDraw,
    finalizeFreehandDraw
  } = useEditorStore();
  
  const { screenToFlowPosition } = useReactFlow();

  // Listen for external drawing starts (like from a shape component border)
  useEffect(() => {
    if (drawingArrowFrom && !anchorNodeDetails) {
      initializeArrowFromExternal();
    }
  }, [drawingArrowFrom, anchorNodeDetails, initializeArrowFromExternal]);

  const handleMouseDown = useCallback((event: ReactMouseEvent) => {
    if ((activeTool !== sidebarTools.RECTANGLE && activeTool !== sidebarTools.ELLIPSE && activeTool !== sidebarTools.ARROW && activeTool !== sidebarTools.TEXT) || event.button !== 0) return;
    event.preventDefault();

    const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    startFreehandDraw(flowPosition);
  }, [activeTool, screenToFlowPosition, startFreehandDraw]);

  const handleMouseMove = useCallback((event: ReactMouseEvent) => {
    const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    updateFreehandDraw(flowPosition);
  }, [screenToFlowPosition, updateFreehandDraw]);

  const handleMouseUp = useCallback(() => {
    finalizeFreehandDraw();
  }, [finalizeFreehandDraw]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
