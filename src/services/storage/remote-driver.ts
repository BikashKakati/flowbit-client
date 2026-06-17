import { apiClient } from '../../config/api-client';
import type { Space } from '../api/space-service';
import type { FlowMetadata } from '../api/flow-service';
import type { CanvasData } from '../api/canvas-service';

export class RemoteDriver {
  // Space Operations
  async getSpaces(): Promise<Space[]> {
    const res = await apiClient.get<{ success: boolean, data: Space[] }>('/spaces');
    return res.data.data;
  }

  async createSpace(id: string, name: string): Promise<Space> {
    const res = await apiClient.post<{ success: boolean, data: Space }>('/spaces', { id, name });
    return res.data.data;
  }

  async updateSpace(id: string, name: string): Promise<Space> {
    const res = await apiClient.put<{ success: boolean, data: Space }>(`/spaces/${id}`, { name });
    return res.data.data;
  }

  async deleteSpace(id: string): Promise<void> {
    await apiClient.delete(`/spaces/${id}`);
  }

  // Flow Operations
  async getFlows(spaceId: string): Promise<FlowMetadata[]> {
    const res = await apiClient.get<{ success: boolean, data: FlowMetadata[] }>(`/spaces/${spaceId}/flows`);
    return res.data.data;
  }

  async createFlow(spaceId: string, id: string, name: string): Promise<FlowMetadata> {
    const res = await apiClient.post<{ success: boolean, data: FlowMetadata }>(`/spaces/${spaceId}/flows`, { id, name });
    return res.data.data;
  }

  async updateFlowName(id: string, name: string): Promise<FlowMetadata> {
    const res = await apiClient.put<{ success: boolean, data: FlowMetadata }>(`/flows/${id}/name`, { name });
    return res.data.data;
  }

  async deleteFlow(id: string): Promise<void> {
    await apiClient.delete(`/flows/${id}`);
  }

  // Canvas Operations
  async getCanvasContent(flowId: string): Promise<CanvasData | null> {
    try {
      const res = await apiClient.get<{ success: boolean, data: CanvasData }>(`/flows/${flowId}/canvas`);
      return res.data.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  async saveCanvas(flowId: string, nodes: any[], edges: any[]): Promise<void> {
    await apiClient.post(`/flows/${flowId}/canvas`, { nodes, edges });
  }
}

export const remoteDriver = new RemoteDriver();
