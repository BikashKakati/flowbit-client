import { NodeResizer, Position, type NodeProps } from '@xyflow/react';
import React, { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '../../../store/editor-store';
import type { ShapeNode } from '../../../types';
import EditableTextArea from '../../common/EditableText';
import { adjustColorBrightness, getContrastTextColor } from '../../../utils/colors';

const EllipseNode: React.FC<NodeProps<ShapeNode>> = ({ data = {}, selected, id, width, height }) => {
  const nodeMinWidth = 100;
  const nodeMinHeight = 80;
  const margin = 8;
  const spaceBetweenSvgNEllipse = 6;
  const wrapperWidth = width ?? 256;
  const wrapperHeight = height ?? 256;
  const nodeWidth = Math.max(0, wrapperWidth - margin * 2);
  const nodeHeight = Math.max(0, wrapperHeight - margin * 2);


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
      // An ellipse circumscribing a rectangle of given size has greater height constraints.
      // Roughly expanding height enough to fit text
      const requiredHeight = (size.height + padding) * 1.414;

      if (requiredHeight > nodeHeight) {
        updateShapeNode(id, { height: requiredHeight + margin * 2 });
      }
    }
  }, [isTextAreaEnabled, nodeHeight, id, updateShapeNode]);

  const dynamicMinWidth = Math.max(nodeMinWidth, contentSize.width * 1.414);
  const dynamicMinHeight = Math.max(nodeMinHeight, contentSize.height * 1.414);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || activeTool !== 'arrow' || isTextAreaEnabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cx = wrapperWidth / 2;
    const cy = wrapperHeight / 2;
    const rx = nodeWidth / 2;
    const ry = nodeHeight / 2;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const angle = Math.atan2(dy, dx);

    const r_ellipse = (rx * ry) / Math.sqrt(Math.pow(ry * Math.cos(angle), 2) + Math.pow(rx * Math.sin(angle), 2));
    const dist = Math.sqrt(dx * dx + dy * dy);

    const SNAP_THRESHOLD = 20;

    if (Math.abs(dist - r_ellipse) < SNAP_THRESHOLD) {
      const snapX = cx + r_ellipse * Math.cos(angle);
      const snapY = cy + r_ellipse * Math.sin(angle);

      const deg = angle * 180 / Math.PI;
      let handlePos = Position.Right;
      if (deg > 45 && deg <= 135) handlePos = Position.Bottom;
      else if (deg > 135 || deg <= -135) handlePos = Position.Left;
      else if (deg > -135 && deg <= -45) handlePos = Position.Top;

      setHoverPos({ x: snapX, y: snapY, handlePosition: handlePos });
    } else {
      setHoverPos(null);
    }
  }, [wrapperWidth, wrapperHeight, nodeWidth, nodeHeight, activeTool, isTextAreaEnabled]);

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const handleAnchorMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hoverPos) {
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
        width={nodeWidth + spaceBetweenSvgNEllipse}
        height={nodeHeight + spaceBetweenSvgNEllipse}
      >
        <ellipse
          cx={(nodeWidth + spaceBetweenSvgNEllipse) / 2}
          cy={(nodeHeight + spaceBetweenSvgNEllipse) / 2}
          rx={nodeWidth / 2}
          ry={nodeHeight / 2}
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

      <div style={{
        position: 'absolute',
        left: margin + (nodeWidth - nodeWidth * 0.7071) / 2,
        top: margin + (nodeHeight - nodeHeight * 0.7071) / 2,
        width: nodeWidth * 0.7071,
        height: nodeHeight * 0.7071,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
            lineClassName="!border-indigo-400 rounded-full !border-[1.2px]"
            handleClassName="!w-2 !h-2 !bg-white !border-2 !border-indigo-500 rounded-full shadow-sm"
          />
        )

      }
    </div>
  );
};

export default EllipseNode;
