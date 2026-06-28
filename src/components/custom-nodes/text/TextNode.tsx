import { NodeResizer, type NodeProps } from '@xyflow/react';
import React, { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '../../../store/editor-store';
import type { ShapeNode } from '../../../types';
import EditableTextArea from '../../common/EditableText';

const checkIsCorner = (direction: any): boolean => {
  if (!direction) return false;
  if (Array.isArray(direction)) {
    if (typeof direction[0] === 'number') {
      return direction[0] !== 0 && direction[1] !== 0;
    }
    return direction.length === 2;
  }
  return false;
};

const TextNode: React.FC<NodeProps<ShapeNode>> = ({ data = {}, selected, id, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartSize = useRef<{ width: number; height: number; fontSize: number } | null>(null);
  const isResizing = useRef(false);
  const isCornerRef = useRef(false);

  const { activeTool, nodes, updateShapeNode, commitHistory, cutNodeIds = [] } = useEditorStore();
  const isCut = cutNodeIds.includes(id);

  const storeNode = nodes.find(n => n.id === id);
  const currentWidth = storeNode?.width ?? width ?? 180;
  const currentHeight = storeNode?.height ?? height ?? 40;
  const currentFontSize = (storeNode?.data as any)?.fontSize ?? data.fontSize ?? 14;

  const [isTextAreaEnabled, setIsTextAreaEnabled] = useState(false);
  const [keepRatio, setKeepRatio] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const textVal = (storeNode?.data as any)?.content?.text || data.content?.text || 'Double click to edit text';

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
    if (isResizing.current) return;

    // Add vertical padding, e.g. 16px (8px top, 8px bottom)
    const requiredHeight = size.height + 16;
    const roundedHeight = Math.ceil(requiredHeight);

    // Only update if difference is greater than 1px to prevent subpixel jitter loops
    if (Math.abs(roundedHeight - (currentHeight ?? 40)) > 1) {
      updateShapeNode(id, { height: roundedHeight });
    }
  }, [id, currentHeight, updateShapeNode]);

  // NodeResizer Callbacks
  const handleResizeStart = useCallback((_event: any, params: any) => {
    commitHistory();
    isResizing.current = true;
    
    // Check elements classes for top-left/top-right/bottom-left/bottom-right (both space-separated and hyphenated)
    const target = _event?.target as HTMLElement;
    const className = target?.getAttribute?.('class') || target?.className || '';
    const isCornerByClass = (className.includes('top') && className.includes('left')) ||
                            (className.includes('top') && className.includes('right')) ||
                            (className.includes('bottom') && className.includes('left')) ||
                            (className.includes('bottom') && className.includes('right')) ||
                            className.includes('top-left') || 
                            className.includes('top-right') || 
                            className.includes('bottom-left') || 
                            className.includes('bottom-right');
                     
    const isCorner = isCornerByClass || checkIsCorner(params.direction);
    isCornerRef.current = isCorner;
    setKeepRatio(isCorner);
    
    dragStartSize.current = {
      width: currentWidth,
      height: currentHeight,
      fontSize: currentFontSize
    };
  }, [currentWidth, currentHeight, currentFontSize, commitHistory]);

  const handleResize = useCallback((_event: any, params: any) => {
    const isCorner = checkIsCorner(params.direction) || isCornerRef.current;

    if (isCorner && dragStartSize.current) {
      const minRatio = 6 / dragStartSize.current.fontSize;
      const minWidthAllowed = dragStartSize.current.width * minRatio;
      const minHeightAllowed = dragStartSize.current.height * minRatio;

      let targetWidth = params.width;
      let targetHeight = params.height;
      let targetFontSize = Math.round(dragStartSize.current.fontSize * (params.width / dragStartSize.current.width));

      if (targetFontSize < 6) {
        targetWidth = minWidthAllowed;
        targetHeight = minHeightAllowed;
        targetFontSize = 6;
      } else if (targetFontSize > 120) {
        const maxRatio = 120 / dragStartSize.current.fontSize;
        targetWidth = dragStartSize.current.width * maxRatio;
        targetHeight = dragStartSize.current.height * maxRatio;
        targetFontSize = 120;
      }

      updateShapeNode(id, {
        width: targetWidth,
        height: targetHeight,
        fontSize: targetFontSize
      } as any);
    } else {
      updateShapeNode(id, {
        width: params.width
      });
    }
  }, [id, updateShapeNode]);

  const handleResizeEnd = useCallback((_event: any, _params: any) => {
    isResizing.current = false;
    isCornerRef.current = false;
    setKeepRatio(false);
  }, []);

  // Styling text color: softer black slate-700 by default, dark black slate-900 on select/hover/editing
  const defaultColor = (selected || isHovered || isTextAreaEnabled) ? '#000000' : '#475569';
  const displayTextColor = (storeNode?.data as any)?.textColor || data.textColor || defaultColor;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative p-2 rounded-xl text-left select-none outline-none border border-transparent transition-colors duration-150 text-node-resizer bg-transparent"
      style={{
        width: '100%',
        height: '100%',
        opacity: isCut ? 0.5 : 1,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-full h-full text-left flex items-center justify-start">
        <EditableTextArea
          initialText={textVal === 'Double click to edit text' && isTextAreaEnabled ? '' : textVal}
          isTextAreaEnabled={isTextAreaEnabled}
          onSave={handleSave}
          onCancel={handleCancel}
          onContentSizeChange={handleContentSizeChange}
          className="font-normal !text-left !w-full !max-w-full whitespace-pre-wrap break-words block"
          style={{ 
            textAlign: 'left',
            width: '100%',
            maxWidth: '100%',
            fontSize: `${currentFontSize}px`,
            lineHeight: '1.4',
            color: displayTextColor
          }}
        />
      </div>

      {activeTool !== 'arrow' && (
        <NodeResizer
          nodeId={id}
          isVisible={selected}
          minWidth={80}
          keepAspectRatio={keepRatio}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          lineClassName="!border-indigo-455 !border-[1.2px] rounded-xl"
          handleClassName="!w-2 !h-2 !bg-white !border-2 !border-indigo-500 rounded-full shadow-sm"
        />
      )}
    </div>
  );
};

export default TextNode;
