import { HistoryService, type FlowHistoryState } from '../../services/local/history-service';
import type { EditorStoreType } from '../../types/store-types';

const MAX_HISTORY = 50;

// Note: setActiveFlowAction is now handled directly inside history-slice.ts asynchronously


export const commitHistoryAction = (state: EditorStoreType): Partial<EditorStoreType> => {
    if (!state.activeFlowId) return {};

    const currentState: FlowHistoryState = {
        nodes: state.nodes,
        edges: state.edges,
        timestamp: Date.now()
    };

    // Ignore commit if state is completely identical to the last one (structural sharing check)
    if (state.past.length > 0) {
        const lastState = state.past[state.past.length - 1];
        if (lastState.nodes === currentState.nodes && lastState.edges === currentState.edges) {
            return {};
        }
    }

    const newPast = [...state.past, currentState];
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();

    if (newPast.length > MAX_HISTORY) {
        while (newPast.length > MAX_HISTORY && newPast[0].timestamp && (now - newPast[0].timestamp > oneHour)) {
            newPast.shift();
        }
        if (newPast.length > MAX_HISTORY * 2) {
            newPast.splice(0, newPast.length - MAX_HISTORY);
        }
    }

    const newHistory = {
        past: newPast,
        future: [],
    };

    HistoryService.saveHistory(state.activeFlowId, newHistory);
    return newHistory;
};

export const undoHistoryAction = (state: EditorStoreType): Partial<EditorStoreType> => {
    if (!state.activeFlowId || state.past.length === 0) return {};

    const currentState: FlowHistoryState = {
        nodes: state.nodes,
        edges: state.edges,
        timestamp: Date.now()
    };

    const previousState = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    const newFuture = [currentState, ...state.future];

    HistoryService.saveHistory(state.activeFlowId, { past: newPast, future: newFuture });

    return {
        past: newPast,
        future: newFuture,
        nodes: previousState.nodes,
        edges: previousState.edges,
        selectedNodeIds: [],
        selectedEdgeIds: []
    };
};

export const redoHistoryAction = (state: EditorStoreType): Partial<EditorStoreType> => {
    if (!state.activeFlowId || state.future.length === 0) return {};

    const currentState: FlowHistoryState = {
        nodes: state.nodes,
        edges: state.edges,
        timestamp: Date.now()
    };

    const nextState = state.future[0];
    const newFuture = state.future.slice(1);
    const newPast = [...state.past, currentState];

    HistoryService.saveHistory(state.activeFlowId, { past: newPast, future: newFuture });

    return {
        past: newPast,
        future: newFuture,
        nodes: nextState.nodes,
        edges: nextState.edges,
        selectedNodeIds: [],
        selectedEdgeIds: []
    };
};
