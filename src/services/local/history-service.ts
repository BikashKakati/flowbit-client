import type { AppNode, CustomEdge } from '../../types';
import { HistoryRepository } from '../storage/repository';

export interface FlowHistoryState {
    nodes: AppNode[];
    edges: CustomEdge[];
    timestamp?: number;
}

export interface FlowHistoryData {
    past: FlowHistoryState[];
    future: FlowHistoryState[];
}

export const HistoryService = {
    getHistory: async (flowId: string): Promise<FlowHistoryData> => {
        try {
            return await HistoryRepository.getHistory(flowId);
        } catch (e) {
            console.error(`Failed to load history for flow ${flowId}`, e);
            return { past: [], future: [] };
        }
    },

    saveHistory: async (flowId: string, history: FlowHistoryData): Promise<void> => {
        try {
            await HistoryRepository.saveHistory(flowId, history);
        } catch (e: any) {
            console.error(`Failed to save history for flow ${flowId}`, e);
        }
    },

    clearHistory: async (flowId: string): Promise<void> => {
        try {
            await HistoryRepository.clearHistory(flowId);
        } catch (e) {
            console.error(`Failed to clear history for flow ${flowId}`, e);
        }
    }
};
