import { BaseEdge, getSmoothStepPath, useNodes, type EdgeProps } from "@xyflow/react";
import React from "react";
import type { CustomEdge } from "../../../types";
import { adjustColorBrightness } from "../../../utils/colors";
import { useEditorStore } from "../../../store/editor-store";

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
  const { copiedEdgeIds = [], cutEdgeIds = [] } = useEditorStore();

  const isCopied = copiedEdgeIds.includes(id);
  const isCut = cutEdgeIds.includes(id);

  const [stepTypePath] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition,
    targetPosition
  })

  // The arrow stroke should explicitly highlight if the Edge is selected,
  // OR if either of the  anchor nodes endpoints are selected (being dragged).
  const isEndpointSelected = nodes.some(n => (n.id === source || n.id === target) && n.selected);
  const isSelected = selected || isEndpointSelected;

  const baseColor = data?.arrowColor || "#64748b"; // slate-500
  const displayColor = isSelected ? adjustColorBrightness(baseColor, 0.90) : baseColor;
  const strokeColor = isCopied ? '#6366f1' : (isCut ? '#ef4444' : displayColor);

  return (
    <BaseEdge
      path={stepTypePath}
      markerEnd={markerEnd}
      style={{
        stroke: strokeColor,
        strokeWidth: (isSelected || isCopied || isCut) ? 1.5 : 1,
        strokeDasharray: (isCopied || isCut) ? '5,5' : undefined,
        opacity: isCut ? 0.5 : 1
      }}
    />
  );
};

export default ConnectableArrow;
