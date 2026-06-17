import { create } from 'zustand';
import type { Space } from '../services/api/space-service';
import type { FlowMetadata } from '../services/api/flow-service';

export interface WorkspaceState {
    spaces: Space[];
    flows: FlowMetadata[];
    fetchedSpaceIds: string[];
    activeSpaceId: string | null;
    setSpaces: (spaces: Space[]) => void;
    addSpace: (space: Space) => void;
    updateSpace: (id: string, name: string) => void;
    deleteSpace: (id: string) => void;
    setFlowsForSpace: (spaceId: string, spaceFlows: FlowMetadata[]) => void;
    addFlow: (flow: FlowMetadata) => void;
    updateFlow: (id: string, name: string) => void;
    deleteFlow: (id: string) => void;
    setActiveSpaceId: (id: string | null) => void;
    getFlowById: (id: string) => FlowMetadata | undefined;
    getFlowsBySpaceId: (spaceId: string) => FlowMetadata[];
    hasFetchedFlowsForSpace: (spaceId: string) => boolean;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
    spaces: [],
    flows: [],
    fetchedSpaceIds: [],
    activeSpaceId: null,

    setSpaces: (spaces) => set({ spaces }),
    addSpace: (space) => set((state) => ({ spaces: [...state.spaces, space] })),
    updateSpace: (id, name) => set((state) => ({
        spaces: state.spaces.map((s) => (s.id === id ? { ...s, name } : s))
    })),
    deleteSpace: (id) => set((state) => {
        const nextSpaces = state.spaces.filter((s) => s.id !== id);
        const nextActiveId = state.activeSpaceId === id
            ? (nextSpaces[0]?.id || null)
            : state.activeSpaceId;
        return {
            spaces: nextSpaces,
            flows: state.flows.filter((f) => f.spaceId !== id),
            activeSpaceId: nextActiveId
        };
    }),

    setFlowsForSpace: (spaceId, spaceFlows) => set((state) => {
        const filteredFlows = state.flows.filter((f) => f.spaceId !== spaceId);
        return { 
            flows: [...filteredFlows, ...spaceFlows],
            fetchedSpaceIds: [...new Set([...state.fetchedSpaceIds, spaceId])]
        };
    }),
    
    addFlow: (flow) => set((state) => ({ flows: [...state.flows, flow] })),
    updateFlow: (id, name) => set((state) => ({
        flows: state.flows.map((f) => (f.id === id ? { ...f, name } : f))
    })),
    deleteFlow: (id) => set((state) => ({
        flows: state.flows.filter((f) => f.id !== id)
    })),

    setActiveSpaceId: (activeSpaceId) => set({ activeSpaceId }),

    getFlowById: (id) => get().flows.find((f) => f.id === id),
    
    getFlowsBySpaceId: (spaceId) => get().flows.filter((f) => f.spaceId === spaceId),
    
    hasFetchedFlowsForSpace: (spaceId) => get().fetchedSpaceIds.includes(spaceId),
}));
