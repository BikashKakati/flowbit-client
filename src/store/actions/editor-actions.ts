import type { EditorStoreType } from '../../types/store-types';
import { ShapeNodeType, EdgeTypes, type AnchorNodeType, type ShapeNode, type CustomEdge, type AppNode } from '../../types';
import { MarkerType } from '@xyflow/react';
import { sidebarTools } from '../../constant';
import { calculateSnapTarget } from '../../utils/snapping';
import { getUniqueId } from '../../utils';

export const initializeArrowFromExternalAction = (state: EditorStoreType): Partial<EditorStoreType> | null => {
  if (!state.drawingArrowFrom || state.anchorNodeDetails) return null;

  const sourceNodeId = `anchor-${getUniqueId()}`;
  const targetNodeId = `anchor-${getUniqueId()}`;

  const sourceNode: AnchorNodeType = {
    id: sourceNodeId,
    type: "anchor",
    position: state.drawingArrowFrom.parentId && state.drawingArrowFrom.relativeX !== undefined && state.drawingArrowFrom.relativeY !== undefined
      ? { x: state.drawingArrowFrom.relativeX, y: state.drawingArrowFrom.relativeY }
      : { x: state.drawingArrowFrom.x, y: state.drawingArrowFrom.y },
    parentId: state.drawingArrowFrom.parentId,
    data: { identityType: "source", handlePosition: state.drawingArrowFrom.handlePosition },
    draggable: false, selectable: false, zIndex: 2000,
  };

  const targetNode: AnchorNodeType = {
    id: targetNodeId,
    type: "anchor",
    position: { x: state.drawingArrowFrom.x, y: state.drawingArrowFrom.y },
    data: { identityType: "target" },
    draggable: false, selectable: false, zIndex: 2000,
  };

  const previewEdge: CustomEdge = {
    id: `edge-${sourceNodeId}-${targetNodeId}`,
    source: sourceNodeId,
    target: targetNodeId,
    type: EdgeTypes.connectableArrow,
    data: { arrowColor: '#64748b' },
    markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: '#64748b' },
  };

  return {
    nodes: [...state.nodes, sourceNode, targetNode],
    edges: [...state.edges, previewEdge],
    anchorNodeDetails: { sourceNodeId, targetNodeId },
  };
};

export const startFreehandDrawAction = (
  state: EditorStoreType, 
  flowPosition: { x: number, y: number }
): Partial<EditorStoreType> | null => {
  if (state.activeTool === sidebarTools.RECTANGLE || state.activeTool === sidebarTools.ELLIPSE) {
    const shapeType = state.activeTool === sidebarTools.RECTANGLE ? ShapeNodeType.rectangle : ShapeNodeType.ellipse;
    const prefix = state.activeTool === sidebarTools.RECTANGLE ? 'rect' : 'ellipse';
    const newShapeId = `${prefix}-${getUniqueId()}`;
    
    const newNode: ShapeNode = {
      id: newShapeId, type: shapeType, position: flowPosition,
      data: { content: { text: "" }, bgColor: 'transparent', borderColor: '#64748b' }, width: 0, height: 0, selected: true,
    };

    return {
      nodes: [...state.nodes, newNode],
      drawingShapeDetails: { id: newShapeId, startPosition: flowPosition }
    };
  } else if (state.activeTool === sidebarTools.TEXT) {
    const newTextNodeId = `text-${getUniqueId()}`;
    
    const newNode: ShapeNode = {
      id: newTextNodeId, type: ShapeNodeType.text, position: flowPosition,
      data: { content: { text: "Double click to edit text" }, bgColor: 'transparent', borderColor: 'transparent', fontSize: 14 },
      width: 180, height: 40, selected: true,
    };

    return {
      nodes: [...state.nodes, newNode],
      drawingShapeDetails: { id: newTextNodeId, startPosition: flowPosition }
    };
  } else if (state.activeTool === sidebarTools.ARROW) {
    return {
      drawingArrowFrom: { x: flowPosition.x, y: flowPosition.y }
    };
  }
  return null;
};

export const updateFreehandDrawAction = (
  state: EditorStoreType, 
  flowPosition: { x: number, y: number }
): Partial<EditorStoreType> | null => {
  if (state.anchorNodeDetails) {
    const snapPoint = calculateSnapTarget(flowPosition, state.nodes);
    const newNodes = state.nodes.map((node) => {
      if (node.id === state.anchorNodeDetails!.targetNodeId) {
        return {
          ...node, position: { x: snapPoint.x, y: snapPoint.y },
          parentId: snapPoint.snappedParentId,
          data: { ...node.data, handlePosition: snapPoint.handlePosition }
        } as AppNode;
      }
      return node;
    });
    return { nodes: newNodes };
  } else if (state.drawingShapeDetails && (state.activeTool === sidebarTools.RECTANGLE || state.activeTool === sidebarTools.ELLIPSE)) {
    const { id, startPosition } = state.drawingShapeDetails;
    const newNodes = state.nodes.map((node) => {
      if (node.id === id) {
        const width = Math.abs(flowPosition.x - startPosition.x);
        const height = Math.abs(flowPosition.y - startPosition.y);
        const position = { x: Math.min(flowPosition.x, startPosition.x), y: Math.min(flowPosition.y, startPosition.y) };
        return { ...node, position, width, height } as AppNode;
      }
      return node;
    });
    return { nodes: newNodes };
  } else if (state.drawingShapeDetails && state.activeTool === sidebarTools.TEXT) {
    const { id, startPosition } = state.drawingShapeDetails;
    const newNodes = state.nodes.map((node) => {
      if (node.id === id) {
        const width = Math.max(40, Math.abs(flowPosition.x - startPosition.x));
        const position = { x: Math.min(flowPosition.x, startPosition.x), y: startPosition.y };
        return { ...node, position, width } as AppNode;
      }
      return node;
    });
    return { nodes: newNodes };
  }
  return null;
};

export const finalizeFreehandDrawAction = (state: EditorStoreType): Partial<EditorStoreType> | null => {
  if (state.anchorNodeDetails) {
    const { sourceNodeId, targetNodeId } = state.anchorNodeDetails;
    const newNodes = state.nodes.map((n) => {
      if (n.id === sourceNodeId || n.id === targetNodeId) return { ...n, draggable: true, selectable: true };
      return n;
    });
    const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
    const newEdges = state.edges.map(e => ({ ...e, selected: e.id === edgeId }));

    return {
      nodes: newNodes, edges: newEdges,
      anchorNodeDetails: null, drawingArrowFrom: null, activeTool: 'select' as const
    };
  } else if (state.drawingShapeDetails) {
    const shapeId = state.drawingShapeDetails.id;
    let newNodes = state.nodes;
    if (state.activeTool === sidebarTools.TEXT) {
      newNodes = state.nodes.map(n => {
        if (n.id === shapeId) {
          const width = n.width && n.width > 10 ? n.width : 180;
          return { ...n, width };
        }
        return n;
      });
    }
    return {
      nodes: newNodes,
      drawingShapeDetails: null,
      activeTool: 'select' as const
    };
  }
  return null;
};
