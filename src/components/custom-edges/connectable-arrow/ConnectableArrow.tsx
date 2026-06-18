import { BaseEdge, useNodes, type EdgeProps } from "@xyflow/react";
import React from "react";
import type { CustomEdge } from "../../../types";
import { adjustColorBrightness } from "../../../utils/colors";
import { useEditorStore } from "../../../store/editor-store";
import { sidebarTools } from "../../../constant";

function getSmoothPathFromPoints(points: { x: number; y: number }[], radius = 8): string {
  if (points.length < 3) return "";
  
  let path = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];
    
    const lenPrev = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
    const lenNext = Math.hypot(pNext.x - pCurr.x, pNext.y - pCurr.y);
    
    const r = Math.min(radius, lenPrev / 2, lenNext / 2);
    
    if (r > 0) {
      const dxPrev = (pCurr.x - pPrev.x) / lenPrev;
      const dyPrev = (pCurr.y - pPrev.y) / lenPrev;
      const pStart = { x: pCurr.x - dxPrev * r, y: pCurr.y - dyPrev * r };
      
      const dxNext = (pNext.x - pCurr.x) / lenNext;
      const dyNext = (pNext.y - pCurr.y) / lenNext;
      const pEnd = { x: pCurr.x + dxNext * r, y: pCurr.y + dyNext * r };
      
      path += ` L ${pStart.x},${pStart.y} Q ${pCurr.x},${pCurr.y} ${pEnd.x},${pEnd.y}`;
    } else {
      path += ` L ${pCurr.x},${pCurr.y}`;
    }
  }
  
  const last = points[points.length - 1];
  path += ` L ${last.x},${last.y}`;
  return path;
}

const ConnectableArrow: React.FC<EdgeProps<CustomEdge>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  source,
  data,
  target
}) => {
  const nodes = useNodes();
  const { activeTool, updateEdgeOffsets, commitHistory, copiedEdgeIds = [], cutEdgeIds = [] } = useEditorStore();

  const isCopied = copiedEdgeIds.includes(id);
  const isCut = cutEdgeIds.includes(id);

  const offset = data?.offset || 0;
  const offsetSource = data?.offsetSource || 0;
  const offsetTarget = data?.offsetTarget || 0;

  const isVerticalFlow = 
    (sourcePosition === 'top' || sourcePosition === 'bottom') &&
    (targetPosition === 'top' || targetPosition === 'bottom');

  const sourceOffsetDir = isVerticalFlow 
    ? (sourcePosition === 'bottom' ? 6 : (sourcePosition === 'top' ? -6 : 0))
    : (sourcePosition === 'right' ? 6 : (sourcePosition === 'left' ? -6 : 0));

  const targetOffsetDir = isVerticalFlow 
    ? (targetPosition === 'bottom' ? 6 : (targetPosition === 'top' ? -6 : 0))
    : (targetPosition === 'right' ? 6 : (targetPosition === 'left' ? -6 : 0));

  let points: { x: number; y: number }[] = [];
  
  let sourceDraggableSegmentIndex = 0;
  let centerDraggableSegmentIndex = 1;
  let targetDraggableSegmentIndex = 2;

  if (isVerticalFlow) {
    const centerY = (sourceY + targetY) / 2 + offset;
    const xSource = sourceX + offsetSource;
    const xTarget = targetX + offsetTarget;

    if (offsetSource !== 0 && offsetTarget !== 0) {
      points = [
        { x: sourceX, y: sourceY },
        { x: sourceX, y: sourceY + sourceOffsetDir },
        { x: xSource, y: sourceY + sourceOffsetDir },
        { x: xSource, y: centerY },
        { x: xTarget, y: centerY },
        { x: xTarget, y: targetY + targetOffsetDir },
        { x: targetX, y: targetY + targetOffsetDir },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 2;
      centerDraggableSegmentIndex = 3;
      targetDraggableSegmentIndex = 4;
    } else if (offsetSource !== 0) {
      points = [
        { x: sourceX, y: sourceY },
        { x: sourceX, y: sourceY + sourceOffsetDir },
        { x: xSource, y: sourceY + sourceOffsetDir },
        { x: xSource, y: centerY },
        { x: targetX, y: centerY },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 2;
      centerDraggableSegmentIndex = 3;
      targetDraggableSegmentIndex = 4;
    } else if (offsetTarget !== 0) {
      points = [
        { x: sourceX, y: sourceY },
        { x: sourceX, y: centerY },
        { x: xTarget, y: centerY },
        { x: xTarget, y: targetY + targetOffsetDir },
        { x: targetX, y: targetY + targetOffsetDir },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 0;
      centerDraggableSegmentIndex = 1;
      targetDraggableSegmentIndex = 2;
    } else {
      points = [
        { x: sourceX, y: sourceY },
        { x: sourceX, y: centerY },
        { x: targetX, y: centerY },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 0;
      centerDraggableSegmentIndex = 1;
      targetDraggableSegmentIndex = 2;
    }
  } else {
    const centerX = (sourceX + targetX) / 2 + offset;
    const ySource = sourceY + offsetSource;
    const yTarget = targetY + offsetTarget;

    if (offsetSource !== 0 && offsetTarget !== 0) {
      points = [
        { x: sourceX, y: sourceY },
        { x: sourceX + sourceOffsetDir, y: sourceY },
        { x: sourceX + sourceOffsetDir, y: ySource },
        { x: centerX, y: ySource },
        { x: centerX, y: yTarget },
        { x: targetX + targetOffsetDir, y: yTarget },
        { x: targetX + targetOffsetDir, y: targetY },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 2;
      centerDraggableSegmentIndex = 3;
      targetDraggableSegmentIndex = 4;
    } else if (offsetSource !== 0) {
      points = [
        { x: sourceX, y: sourceY },
        { x: sourceX + sourceOffsetDir, y: sourceY },
        { x: sourceX + sourceOffsetDir, y: ySource },
        { x: centerX, y: ySource },
        { x: centerX, y: targetY },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 2;
      centerDraggableSegmentIndex = 3;
      targetDraggableSegmentIndex = 4;
    } else if (offsetTarget !== 0) {
      points = [
        { x: sourceX, y: sourceY },
        { x: centerX, y: sourceY },
        { x: centerX, y: yTarget },
        { x: targetX + targetOffsetDir, y: yTarget },
        { x: targetX + targetOffsetDir, y: targetY },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 0;
      centerDraggableSegmentIndex = 1;
      targetDraggableSegmentIndex = 2;
    } else {
      points = [
        { x: sourceX, y: sourceY },
        { x: centerX, y: sourceY },
        { x: centerX, y: targetY },
        { x: targetX, y: targetY }
      ];
      sourceDraggableSegmentIndex = 0;
      centerDraggableSegmentIndex = 1;
      targetDraggableSegmentIndex = 2;
    }
  }

  const smoothPath = getSmoothPathFromPoints(points, 8);

  const isEndpointSelected = nodes.some(n => (n.id === source || n.id === target) && n.selected);
  const isSelected = selected || isEndpointSelected;

  const baseColor = data?.arrowColor || "#64748b";
  const displayColor = isSelected ? adjustColorBrightness(baseColor, 0.90) : baseColor;
  const strokeColor = isCopied ? '#6366f1' : (isCut ? '#ef4444' : displayColor);

  const handleMouseDown = (
    e: React.MouseEvent,
    segmentIndex: number,
    isVerticalSegment: boolean
  ) => {
    if (activeTool !== sidebarTools.SELECT) return;
    
    e.stopPropagation();
    e.preventDefault();

    commitHistory();

    const startX = e.clientX;
    const startY = e.clientY;
    
    const initialOffset = offset;
    const initialOffsetSource = offsetSource;
    const initialOffsetTarget = offsetTarget;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (isVerticalFlow) {
        if (segmentIndex === centerDraggableSegmentIndex && !isVerticalSegment) {
          updateEdgeOffsets(id, { offset: initialOffset + deltaY });
        } else if (segmentIndex === sourceDraggableSegmentIndex && isVerticalSegment) {
          updateEdgeOffsets(id, { offsetSource: initialOffsetSource + deltaX });
        } else if (segmentIndex === targetDraggableSegmentIndex && isVerticalSegment) {
          updateEdgeOffsets(id, { offsetTarget: initialOffsetTarget + deltaX });
        }
      } else {
        if (segmentIndex === centerDraggableSegmentIndex && isVerticalSegment) {
          updateEdgeOffsets(id, { offset: initialOffset + deltaX });
        } else if (segmentIndex === sourceDraggableSegmentIndex && !isVerticalSegment) {
          updateEdgeOffsets(id, { offsetSource: initialOffsetSource + deltaY });
        } else if (segmentIndex === targetDraggableSegmentIndex && !isVerticalSegment) {
          updateEdgeOffsets(id, { offsetTarget: initialOffsetTarget + deltaY });
        }
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const isSelectTool = activeTool === sidebarTools.SELECT;

  return (
    <g className="react-flow__edge">
      <BaseEdge
        path={smoothPath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: (isSelected || isCopied || isCut) ? 1.5 : 1,
          strokeDasharray: (isCopied || isCut) ? '5,5' : undefined,
          opacity: isCut ? 0.5 : 1
        }}
      />
      {points.slice(0, -1).map((pStart, idx) => {
        const pEnd = points[idx + 1];
        const isVerticalSegment = Math.abs(pStart.x - pEnd.x) < 1;
        
        const isDraggableSegment = 
          idx === sourceDraggableSegmentIndex ||
          idx === centerDraggableSegmentIndex ||
          idx === targetDraggableSegmentIndex;

        if (!isDraggableSegment) return null;

        const cursor = isSelectTool ? (isVerticalSegment ? "ew-resize" : "ns-resize") : "inherit";

        return (
          <path
            key={idx}
            d={`M ${pStart.x},${pStart.y} L ${pEnd.x},${pEnd.y}`}
            fill="none"
            stroke="transparent"
            strokeWidth={16}
            style={{ cursor, pointerEvents: isSelectTool ? "stroke" : "none" }}
            onMouseDown={(e) => handleMouseDown(e, idx, isVerticalSegment)}
          />
        );
      })}
    </g>
  );
};

export default ConnectableArrow;
