import { Position } from "@xyflow/react";
import { ShapeNodeType, type AppNode } from "../types";

export interface SnapResult {
  x: number;
  y: number;
  handlePosition?: Position;
  snappedParentId?: string;
}

export const PADDING = 20; // snapping radius

export function calculateSnapTarget(
  targetPosition: { x: number; y: number },
  nodes: AppNode[]
): SnapResult {
  const result: SnapResult = { x: targetPosition.x, y: targetPosition.y };

  for (const node of nodes) {
    if (!node.position) continue;

    if (node.type === ShapeNodeType.rectangle || node.type === ShapeNodeType.text) {
      const margin = 8;
      const wrapperWidth = node.width ?? 336;
      const wrapperHeight = node.height ?? 208;

      const localX = targetPosition.x - node.position.x;
      const localY = targetPosition.y - node.position.y;

      const leftMargin = margin;
      const rightMargin = wrapperWidth - margin;
      const topMargin = margin;
      const bottomMargin = wrapperHeight - margin;

      const inXBounds = localX >= -PADDING && localX <= wrapperWidth + PADDING;
      const inYBounds = localY >= -PADDING && localY <= wrapperHeight + PADDING;

      if (inXBounds && inYBounds) {
        const distLeft = Math.abs(localX - leftMargin);
        const distRight = Math.abs(localX - rightMargin);
        const distTop = Math.abs(localY - topMargin);
        const distBottom = Math.abs(localY - bottomMargin);

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);
        if (minDist <= PADDING) {
          result.snappedParentId = node.id;
          result.handlePosition = Position.Top; // Default

          if (minDist === distLeft) {
            result.x = leftMargin;
            result.y = localY;
            result.handlePosition = Position.Left;
          } else if (minDist === distRight) {
            result.x = rightMargin;
            result.y = localY;
            result.handlePosition = Position.Right;
          } else if (minDist === distTop) {
            result.x = localX;
            result.y = topMargin;
            result.handlePosition = Position.Top;
          } else if (minDist === distBottom) {
            result.x = localX;
            result.y = bottomMargin;
            result.handlePosition = Position.Bottom;
          }
          break; // Snapped to this node
        }
      }
    } else if (node.type === ShapeNodeType.ellipse) {
      const margin = 8;
      const wrapperWidth = node.width ?? 256;
      const wrapperHeight = node.height ?? 256;
      const nodeWidth = Math.max(0, wrapperWidth - margin * 2);
      const nodeHeight = Math.max(0, wrapperHeight - margin * 2);

      const localX = targetPosition.x - node.position.x;
      const localY = targetPosition.y - node.position.y;

      const cx = wrapperWidth / 2;
      const cy = wrapperHeight / 2;
      const rx = nodeWidth / 2;
      const ry = nodeHeight / 2;
      
      const dx = localX - cx;
      const dy = localY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (
        localX >= -PADDING &&
        localX <= wrapperWidth + PADDING &&
        localY >= -PADDING &&
        localY <= wrapperHeight + PADDING
      ) {
        const angle = Math.atan2(dy, dx);
        const r_ellipse =
          (rx * ry) /
          Math.sqrt(
            Math.pow(ry * Math.cos(angle), 2) +
              Math.pow(rx * Math.sin(angle), 2)
          );

        if (Math.abs(dist - r_ellipse) <= PADDING) {
          result.snappedParentId = node.id;
          result.x = cx + r_ellipse * Math.cos(angle);
          result.y = cy + r_ellipse * Math.sin(angle);

          const deg = (angle * 180) / Math.PI;
          result.handlePosition = Position.Right;
          if (deg > 45 && deg <= 135) result.handlePosition = Position.Bottom;
          else if (deg > 135 || deg <= -135) result.handlePosition = Position.Left;
          else if (deg > -135 && deg <= -45) result.handlePosition = Position.Top;
          
          break;
        }
      }
    }
  }

  return result;
}
