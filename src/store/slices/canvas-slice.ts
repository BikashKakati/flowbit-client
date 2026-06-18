import type { StateCreator } from 'zustand';
import type { EditorStoreType, CanvasSlice } from '../../types/store-types';
import type { CustomEdge } from '../../types';
import {
  initializeCanvasDataAction,
  updateShapeNodeAction,
  updateEdgeStyleAction,
  deleteElementsAction,
  onNodesChangeAction,
  onEdgesChangeAction,
  onConnectAction,
  updateAnchorPositionsAction,
  createGroupAction,
  ungroupAction,
} from '../actions/canvas-actions';
import {
  copyElementsAction,
  cutElementsAction,
  pasteElementsAction,
} from '../actions/clipboard-actions';

export const createCanvasSlice: StateCreator<EditorStoreType, [], [], CanvasSlice> = (set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  copiedNodeIds: [],
  copiedEdgeIds: [],
  cutNodeIds: [],
  cutEdgeIds: [],
  clipboard: null,
  initializeCanvasData: (nodes, edges) => set((state: EditorStoreType) => initializeCanvasDataAction(state, nodes, edges)),
  updateShapeNode: (id, updates) => {
    get().commitHistory();
    set((state: EditorStoreType) => updateShapeNodeAction(state, id, updates));
  },
  updateEdgeStyle: (id, updates) => {
    get().commitHistory();
    set((state: EditorStoreType) => updateEdgeStyleAction(state, id, updates));
  },
  updateEdgeOffsets: (id, offsets) => set((state: EditorStoreType) => {
    const newEdges = state.edges.map(edge => {
      if (edge.id === id) {
        return {
          ...edge,
          data: {
            ...edge.data,
            ...offsets
          }
        } as CustomEdge;
      }
      return edge;
    });
    return { edges: newEdges };
  }),
  deleteElements: (ids, type) => {
    get().commitHistory();
    set((state: EditorStoreType) => deleteElementsAction(state, ids, type));
  },
  onNodesChange: (changes) => set((state: EditorStoreType) => onNodesChangeAction(state, changes)),
  onEdgesChange: (changes) => set((state: EditorStoreType) => onEdgesChangeAction(state, changes)),
  onConnect: (connection) => {
    get().commitHistory();
    set((state: EditorStoreType) => onConnectAction(state, connection));
  },
  updateAnchorPositions: (changes, anchorChanges) => set((state: EditorStoreType) => updateAnchorPositionsAction(state, changes, anchorChanges) || {}),
  createGroup: () => {
    get().commitHistory();
    set((state: EditorStoreType) => createGroupAction(state));
  },
  ungroup: () => {
    get().commitHistory();
    set((state: EditorStoreType) => ungroupAction(state));
  },
  copyElements: () => set((state: EditorStoreType) => copyElementsAction(state)),
  cutElements: () => set((state: EditorStoreType) => cutElementsAction(state)),
  pasteElements: () => {
    get().commitHistory();
    set((state: EditorStoreType) => pasteElementsAction(state));
  },
});
