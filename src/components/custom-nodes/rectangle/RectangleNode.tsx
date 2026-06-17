import { NodeResizer, Position, type NodeProps } from '@xyflow/react';
import React, { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '../../../store/editor-store';
import type { ShapeNode } from '../../../types';
import EditableTextArea from '../../common/EditableText';
import { adjustColorBrightness, getContrastTextColor } from '../../../utils/colors';

const RectangleNode: React.FC<NodeProps<ShapeNode>> = ({ data = {}, selected, id, width, height }) => {
  const nodeMinWidth = 100;
  const nodeMinHeight = 80;
  const margin = 8;
  const spaceBetweenSvgNRect = 6;
  const wrapperWidth = width ?? 336;
  const wrapperHeight = height ?? 208;
  const nodeWidth = Math.max(0, wrapperWidth - margin * 2);
  const nodeHeight = Math.max(0, wrapperHeight - margin * 2);

  const CORNER_RADIUS = 10;
  const STROKE_WIDTH = 1;

  const { activeTool, setDrawingArrowFrom, updateShapeNode, commitHistory, copiedNodeIds = [], cutNodeIds = [] } = useEditorStore();
  const isCopied = copiedNodeIds.includes(id);
  const isCut = cutNodeIds.includes(id);

  const [hoverPos, setHoverPos] = useState<{ x: number, y: number, handlePosition: Position } | null>(null);
  const [isTextAreaEnabled, setIsTextAreaEnabled] = useState(false);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const baseBg = data.bgColor || 'transparent';
  const baseBorder = data.borderColor || '#64748b';

  const displayBg = selected ? adjustColorBrightness(baseBg, 0.98) : baseBg;
  const displayBorder = isCopied ? '#6366f1' : (isCut ? '#ef4444' : (selected ? adjustColorBrightness(baseBorder, 0.75) : baseBorder));
  const textColor = getContrastTextColor(displayBg);

  const handleDoubleClick = useCallback(() => {
    if (selected) {
      setIsTextAreaEnabled(true);
    }
  }, [selected]);

  const handleSave = useCallback((newText: string) => {
    updateShapeNode(id, { text: newText });
    setIsTextAreaEnabled(false);
  }, [id, updateShapeNode]);

  const handleCancel = useCallback(() => {
    setIsTextAreaEnabled(false);
  }, []);

  const handleContentSizeChange = useCallback((size: { width: number; height: number }) => {
    setContentSize(size);

    if (isTextAreaEnabled) {
      const padding = 8;
      const requiredHeight = size.height + padding;

      if (requiredHeight > nodeHeight) {
        updateShapeNode(id, { height: requiredHeight + margin * 2 });
      }
    }
  }, [isTextAreaEnabled, nodeHeight, id, updateShapeNode]);

  const dynamicMinWidth = Math.max(nodeMinWidth, contentSize.width);
  const dynamicMinHeight = Math.max(nodeMinHeight, contentSize.height);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || activeTool !== 'arrow' || isTextAreaEnabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Define the borders relative to the container
    const leftMargin = margin;
    const rightMargin = wrapperWidth - margin;
    const topMargin = margin;
    const bottomMargin = wrapperHeight - margin;

    // distances to each border
    const distLeft = Math.abs(mouseX - leftMargin);
    const distRight = Math.abs(mouseX - rightMargin);
    const distTop = Math.abs(mouseY - topMargin);
    const distBottom = Math.abs(mouseY - bottomMargin);

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    const SNAP_THRESHOLD = 20;

    if (minDist < SNAP_THRESHOLD) {
      // Find which border it's closest to and lock to that border
      if (minDist === distLeft) {
        setHoverPos({ x: leftMargin, y: Math.max(topMargin, Math.min(mouseY, bottomMargin)), handlePosition: Position.Left });
      } else if (minDist === distRight) {
        setHoverPos({ x: rightMargin, y: Math.max(topMargin, Math.min(mouseY, bottomMargin)), handlePosition: Position.Right });
      } else if (minDist === distTop) {
        setHoverPos({ x: Math.max(leftMargin, Math.min(mouseX, rightMargin)), y: topMargin, handlePosition: Position.Top });
      } else if (minDist === distBottom) {
        setHoverPos({ x: Math.max(leftMargin, Math.min(mouseX, rightMargin)), y: bottomMargin, handlePosition: Position.Bottom });
      }
    } else {
      setHoverPos(null);
    }
  }, [wrapperWidth, wrapperHeight, activeTool, isTextAreaEnabled]);

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const handleAnchorMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hoverPos) {
      // we need to set the global position as from starting point
      setDrawingArrowFrom({
        x: e.clientX,
        y: e.clientY,
        parentId: id,
        relativeX: hoverPos.x,
        relativeY: hoverPos.y,
        handlePosition: hoverPos.handlePosition
      });
      setHoverPos(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: wrapperWidth, height: wrapperHeight, opacity: isCut ? 0.5 : 1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >

      <svg
        width={nodeWidth + spaceBetweenSvgNRect}
        height={nodeHeight + spaceBetweenSvgNRect}
      >
        <rect
          x={spaceBetweenSvgNRect / 2 + STROKE_WIDTH / 2}
          y={spaceBetweenSvgNRect / 2 + STROKE_WIDTH / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={CORNER_RADIUS}
          ry={CORNER_RADIUS}
          style={{
            fill: displayBg,
            stroke: displayBorder,
            strokeWidth: (selected || isCopied || isCut) ? 1.5 : 1,
            strokeDasharray: (isCopied || isCut) ? '5,5' : undefined,
          }}
          className={`
            ${selected ? 'shadow-md' : 'shadow-sm hover:shadow-md'}
          `}
        />
      </svg>

      {/* Editable Text Area */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <EditableTextArea
          initialText={data.content?.text || ''}
          isTextAreaEnabled={isTextAreaEnabled}
          onSave={handleSave}
          onCancel={handleCancel}
          onContentSizeChange={handleContentSizeChange}
          className="text-sm leading-relaxed font-medium transition-colors duration-200"
          style={{ color: textColor }}
        />
      </div>

      {hoverPos && activeTool === 'arrow' && (
        <div
          onMouseDown={handleAnchorMouseDown}
          className="absolute w-[14px] h-[14px] bg-indigo-500 border-2 border-white rounded-full cursor-crosshair z-10"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {
        activeTool === "arrow" ? null : (
          <NodeResizer
            nodeId={id}
            isVisible={selected}
            minWidth={dynamicMinWidth + margin * 2}
            minHeight={dynamicMinHeight + margin * 2}
            keepAspectRatio={false}
            onResizeStart={() => commitHistory()}
            lineClassName="!border-indigo-400 rounded-xl !border-[1.2px]"
            handleClassName="!w-2 !h-2 !bg-white !border-2 !border-indigo-500 rounded-full shadow-sm"
          />
        )

      }
    </div>
  );
};

export default RectangleNode;
