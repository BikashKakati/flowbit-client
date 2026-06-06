import { FlowRepository } from "../storage/repository";

export interface FlowMetadata {
  id: string;
  spaceId: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const FlowService = {
  getFlowsBySpace: async (spaceId: string): Promise<FlowMetadata[]> => {
    return await FlowRepository.getFlowsBySpace(spaceId);
  },

  createFlow: async (spaceId: string, id: string, name: string): Promise<FlowMetadata> => {
    return await FlowRepository.createFlow(spaceId, id, name);
  },

  updateFlowName: async (id: string, name: string): Promise<FlowMetadata> => {
    return await FlowRepository.updateFlowName(id, name);
  },

  deleteFlow: async (id: string): Promise<boolean> => {
    try {
      await FlowRepository.deleteFlow(id);
      return true;
    } catch (err) {
      console.error("Failed to delete flow", err);
      return false;
    }
  }
};
