import type { Node, Edge } from '@xyflow/react';
import { debounce } from '../../utils/debounce';
import { CanvasRepository } from '../storage/repository';

export interface CanvasData {
    nodes: Node[];
    edges: Edge[];
    updatedAt?: string | null;
}

class CanvasServiceClass {
    async getCanvasContent(flowId: string): Promise<CanvasData> {
        return await CanvasRepository.getCanvasContent(flowId) as any;
    }

    async saveCanvasContent(flowId: string, nodes: Node[], edges: Edge[]): Promise<{ success: boolean, updatedAt: string }> {
        await CanvasRepository.saveCanvasContent(flowId, nodes as any, edges as any);
        return { success: true, updatedAt: new Date().toISOString() };
    }

    private debouncedSavers: Record<string, (...args: any[]) => void> = {};

    saveCanvasContentDebounced(flowId: string, nodes: Node[], edges: Edge[], delay: number = 2000, onSuccess?: () => void): void {
        if (!this.debouncedSavers[flowId]) {
            this.debouncedSavers[flowId] = debounce(
                async (fId: string, n: Node[], e: Edge[], callback?: () => void) => {
                    try {
                        const cleanNodes = n.map((node: any) => {
                            const { selected, dragging, measured, positionAbsolute, ...rest } = node;
                            return rest;
                        });
                        const cleanEdges = e.map((edge: any) => {
                            const { selected, ...rest } = edge;
                            return rest;
                        });
                        await this.saveCanvasContent(fId, cleanNodes as any, cleanEdges as any);
                        if (callback) callback();
                    } catch (error) {
                        console.error("Failed to cleanly save canvas via debouncer", error);
                    }
                }, delay);
        }

        this.debouncedSavers[flowId](flowId, nodes, edges, onSuccess);
    }
}

export const CanvasService = new CanvasServiceClass();
