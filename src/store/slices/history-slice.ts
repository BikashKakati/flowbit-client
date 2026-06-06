import type { StateCreator } from 'zustand';
import type { EditorStoreType, HistorySlice } from '../../types/store-types';
import {
    commitHistoryAction,
    undoHistoryAction,
    redoHistoryAction,
} from '../actions/history-actions';
import { HistoryService } from '../../services/local/history-service';

export const createHistorySlice: StateCreator<EditorStoreType, [], [], HistorySlice> = (set, _get) => ({
    activeFlowId: null,
    past: [],
    future: [],

    setActiveFlow: async (flowId) => {
        const history = await HistoryService.getHistory(flowId);
        set({
            activeFlowId: flowId,
            past: history.past,
            future: history.future,
        });
    },
    commitHistory: () => set((state: EditorStoreType) => commitHistoryAction(state)),
    undoHistory: () => set((state: EditorStoreType) => undoHistoryAction(state)),
    redoHistory: () => set((state: EditorStoreType) => redoHistoryAction(state)),
});
