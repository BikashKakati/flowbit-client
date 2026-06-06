import { SpaceRepository } from "../storage/repository";

export interface Space {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const SpaceService = {
  getSpaces: async (): Promise<Space[]> => {
    return await SpaceRepository.getSpaces();
  },

  createSpace: async (id: string, name: string): Promise<Space> => {
    return await SpaceRepository.createSpace(id, name);
  },

  updateSpace: async (id: string, newName: string): Promise<Space> => {
    return await SpaceRepository.updateSpace(id, newName);
  },

  deleteSpace: async (id: string): Promise<boolean> => {
    try {
      await SpaceRepository.deleteSpace(id);
      return true;
    } catch (err) {
      console.error("Failed to delete space", err);
      return false;
    }
  }
};
