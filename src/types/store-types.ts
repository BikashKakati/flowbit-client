import type { AppNode, CustomEdge } from './index';
import type { Tool } from './zustand-types';
import type { NodeChange, EdgeChange, Connection, Position } from '@xyflow/react';
import type { FlowHistoryState } from '../services/local/history-service';


export interface CanvasSlice {
  nodes: AppNode[];
  edges: CustomEdge[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  copiedNodeIds: string[];
  copiedEdgeIds: string[];
  cutNodeIds: string[];
  cutEdgeIds: string[];
  clipboard: { nodes: AppNode[]; edges: CustomEdge[]; action: 'copy' | 'cut' } | null;
  initializeCanvasData: (nodes: AppNode[], edges: CustomEdge[]) => void;
  updateShapeNode: (id: string, updates: { text?: string; width?: number; height?: number; bgColor?: string; borderColor?: string; }) => void;
  updateEdgeStyle: (id: string, updates: { arrowColor?: string; }) => void;
  deleteElements: (ids: string[], type: 'node' | 'edge') => void;
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CustomEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  updateAnchorPositions: (changes: NodeChange<AppNode>[], anchorPositionChanges: NodeChange<AppNode>[]) => void;
  createGroup: () => void;
  ungroup: () => void;
  copyElements: () => void;
  cutElements: () => void;
  pasteElements: () => void;
}

export interface InteractionSlice {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  drawingArrowFrom: {
    x: number,
    y: number,
    parentId?: string,
    relativeX?: number,
    relativeY?: number,
    handlePosition?: Position
  } | null;
  setDrawingArrowFrom: (pos: {
    x: number,
    y: number,
    parentId?: string,
    relativeX?: number,
    relativeY?: number,
    handlePosition?: Position
  } | null) => void;
  anchorNodeDetails: { sourceNodeId: string, targetNodeId: string } | null;
  drawingShapeDetails: { id: string, startPosition: { x: number, y: number } } | null;
  initializeArrowFromExternal: () => void;
  startFreehandDraw: (flowPosition: { x: number, y: number }) => void;
  updateFreehandDraw: (flowPosition: { x: number, y: number }) => void;
  finalizeFreehandDraw: () => void;
}

export interface HistorySlice {
  activeFlowId: string | null;
  past: FlowHistoryState[];
  future: FlowHistoryState[];
  setActiveFlow: (flowId: string) => void | Promise<void>;
  commitHistory: () => void;
  undoHistory: () => void;
  redoHistory: () => void;
}

export type EditorStoreType = CanvasSlice & InteractionSlice & HistorySlice;
