import type { AppNode, CustomEdge, CustomGroupNode } from '../../types';
import { applyNodeChanges, applyEdgeChanges, addEdge, MarkerType, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type { EditorStoreType } from '../../types/store-types';
import { calculateSnapTarget } from '../../utils/snapping';
import { getUniqueId } from '../../utils';

export const initializeCanvasDataAction = (
  _state: EditorStoreType,
  nodes: AppNode[],
  edges: CustomEdge[]
): Partial<EditorStoreType> => {
  return { nodes, edges };
};

export const updateShapeNodeAction = (
  state: EditorStoreType,
  id: string,
  updates: { text?: string; width?: number; height?: number; bgColor?: string; borderColor?: string; }
): Partial<EditorStoreType> => {
  let targetIds = [id];
  const targetNode = state.nodes.find(n => n.id === id);
  
  if (targetNode?.type === 'customGroup') {
      const getDescendants = (parentId: string): string[] => {
          let desc: string[] = [];
          state.nodes.forEach(n => {
              if (n.parentId === parentId) {
                  desc.push(n.id);
                  desc = desc.concat(getDescendants(n.id));
              }
          });
          return desc;
      };
      targetIds = getDescendants(id);
  }

  const newNodes = state.nodes.map((node) => {
    if (targetIds.includes(node.id)) {
      if (node.type === 'rectangle' || node.type === 'ellipse') {
        let newData = { ...node.data };
        if (updates.text !== undefined) {
          newData = { ...newData, content: { ...(newData.content || {}), text: updates.text } };
        }
        if (updates.bgColor !== undefined) {
          newData.bgColor = updates.bgColor;
        }
        if (updates.borderColor !== undefined) {
          newData.borderColor = updates.borderColor;
        }
        return {
          ...node,
          data: newData,
          ...(updates.width !== undefined ? { width: updates.width } : {}),
          ...(updates.height !== undefined ? { height: updates.height } : {})
        } as AppNode;
      }
    }
    return node;
  });
  return { nodes: newNodes };
};

export const updateEdgeStyleAction = (
  state: EditorStoreType,
  id: string,
  updates: { arrowColor?: string; offset?: number; }
): Partial<EditorStoreType> => {
  const newEdges = state.edges.map(edge => {
    if (edge.id === id) {
      const newEdge = { ...edge, data: { ...edge.data, arrowColor: updates.arrowColor, offset: updates.offset !== undefined ? updates.offset : edge.data?.offset } } as CustomEdge;
      if (updates.arrowColor) {
        // Must update React Flow's native marker object to change the arrow head
        newEdge.markerEnd = { 
          ...(typeof edge.markerEnd === 'object' ? edge.markerEnd : {}), 
          type: MarkerType.Arrow,
          width: 20, height: 20,
          color: updates.arrowColor 
        };
      }
      return newEdge;
    }
    return edge;
  });
  return { edges: newEdges };
};

export const deleteElementsAction = (
  state: EditorStoreType,
  ids: string[],
  type: 'node' | 'edge'
): Partial<EditorStoreType> => {
  if (type === 'node') {
    let allIdsToDelete = [...ids];
    
    // Auto-delete any children of nodes being deleted
    const getDescendants = (parentId: string): string[] => {
      let desc: string[] = [];
      state.nodes.forEach(n => {
        if (n.parentId === parentId) {
          desc.push(n.id);
          desc = desc.concat(getDescendants(n.id));
        }
      });
      return desc;
    };
    
    ids.forEach(id => {
      allIdsToDelete = allIdsToDelete.concat(getDescendants(id));
    });

    const nextNodes = state.nodes.filter(n => !allIdsToDelete.includes(n.id));
    const selectedNodeIds = state.selectedNodeIds.filter(id => !allIdsToDelete.includes(id));
    
    // Also prune any edges attached to these deleted nodes to keep state clean
    const nextEdges = state.edges.filter(e => !allIdsToDelete.includes(e.source) && !allIdsToDelete.includes(e.target));
    const selectedEdgeIds = state.selectedEdgeIds.filter(id => nextEdges.some(e => e.id === id));

    return { nodes: nextNodes, edges: nextEdges, selectedNodeIds, selectedEdgeIds };
  } else {
    const nextEdges = state.edges.filter(e => !ids.includes(e.id));
    const selectedEdgeIds = state.selectedEdgeIds.filter(id => !ids.includes(id));
    return { edges: nextEdges, selectedEdgeIds };
  }
};

export const onNodesChangeAction = (
  state: EditorStoreType,
  changes: NodeChange<AppNode>[]
): Partial<EditorStoreType> => {
  const getTopmostParentId = (nodeId: string): string => {
      let currentId = nodeId;
      while (true) {
          const node = state.nodes.find(n => n.id === currentId);
          if (node && node.parentId) currentId = node.parentId;
          else break;
      }
      return currentId;
  };

  const resolvedChanges: NodeChange<AppNode>[] = [];
  const processedParents = new Set<string>();

  changes.forEach(change => {
      if (change.type === 'position' && change.position) {
          const node = state.nodes.find(n => n.id === change.id);
          if (node && node.parentId) {
              const topId = getTopmostParentId(node.id);
              if (topId !== node.id) {
                  if (!processedParents.has(topId)) {
                      const topNode = state.nodes.find(n => n.id === topId);
                      if (topNode) {
                          const dx = change.position.x - node.position.x;
                          const dy = change.position.y - node.position.y;
                          
                          resolvedChanges.push({
                              id: topId,
                              type: 'position',
                              position: {
                                  x: topNode.position.x + dx,
                                  y: topNode.position.y + dy
                              },
                              dragging: change.dragging
                          });
                          processedParents.add(topId);
                      }
                  }
                  return; // Drop child position change!
              }
          }
      }
      resolvedChanges.push(change);
  });

  let nextNodes = applyNodeChanges(resolvedChanges, state.nodes) as AppNode[];
  let selectionAltered = false;

  const nodesToSelect = new Set<string>();

  nextNodes.forEach(node => {
      if (node.selected) {
         const topId = getTopmostParentId(node.id);
         if (topId !== node.id) {
             selectionAltered = true;
         }
         nodesToSelect.add(topId);
      }
  });

  if (selectionAltered) {
      nextNodes = nextNodes.map(node => ({
          ...node,
          selected: nodesToSelect.has(node.id)
      }));
  }

  const selectedNodeIds = nextNodes.filter(n => n.selected).map(n => n.id);
  return { nodes: nextNodes, selectedNodeIds };
};

export const onEdgesChangeAction = (
  state: EditorStoreType,
  changes: EdgeChange<CustomEdge>[]
): Partial<EditorStoreType> => {
  const nextEdges = applyEdgeChanges(changes, state.edges) as CustomEdge[];
  const selectedEdgeIds = nextEdges.filter(e => e.selected).map(e => e.id);
  return { edges: nextEdges, selectedEdgeIds };
};

export const onConnectAction = (
  state: EditorStoreType,
  connection: Connection
): Partial<EditorStoreType> => {
  return { edges: addEdge(connection, state.edges) as CustomEdge[] };
};




export const updateAnchorPositionsAction = (
  state: EditorStoreType, 
  nodeChanges: NodeChange<AppNode>[],
  anchorPositionChanges: NodeChange<AppNode>[]
): Partial<EditorStoreType> | null => {
  const nextNodes = applyNodeChanges(nodeChanges, state.nodes) as AppNode[];

  const newNodes = nextNodes.map((node) => {
    const change = anchorPositionChanges.find((c) => c.type === 'position' && c.id === node.id);
    if (change && change.type === 'position' && node.type === 'anchor') {
      let absPos = change.positionAbsolute;
      if (!absPos) {
        absPos = node.position;
        if (node.parentId) {
          const parentNode = state.nodes.find((n) => n.id === node.parentId);
          if (parentNode && parentNode.position) {
            absPos = {
              x: node.position.x + parentNode.position.x,
              y: node.position.y + parentNode.position.y,
            };
          }
        }
      }

      const snapPoint = calculateSnapTarget(absPos, state.nodes);

      return {
        ...node,
        position: { x: snapPoint.x, y: snapPoint.y },
        parentId: snapPoint.snappedParentId,
        data: {
          ...node.data,
          handlePosition: snapPoint.handlePosition,
        },
      } as AppNode;
    }
    return node;
  });

  return { nodes: newNodes };
};

export const createGroupAction = (state: EditorStoreType): Partial<EditorStoreType> => {
  if (state.selectedNodeIds.length < 2) return {};

  const selectedNodes = state.nodes.filter(n => state.selectedNodeIds.includes(n.id));
  
  const getAbsPos = (node: AppNode): { x: number, y: number } => {
     let x = node.position.x;
     let y = node.position.y;
     let current = node;
     while(current.parentId) {
         const parent = state.nodes.find(n => n.id === current.parentId);
         if(parent) {
            x += parent.position.x;
            y += parent.position.y;
            current = parent;
         } else break;
     }
     return { x, y };
  };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const padding = 20;

  selectedNodes.forEach(n => {
     const abs = getAbsPos(n);
     const w = n.measured?.width ?? (n.width ?? 0);
     const h = n.measured?.height ?? (n.height ?? 0);
     if (abs.x < minX) minX = abs.x;
     if (abs.y < minY) minY = abs.y;
     if (abs.x + w > maxX) maxX = abs.x + w;
     if (abs.y + h > maxY) maxY = abs.y + h;
  });

  const groupWidth = maxX - minX + (padding * 2);
  const groupHeight = maxY - minY + (padding * 2);
  const groupX = minX - padding;
  const groupY = minY - padding;

  const groupId = `group-${getUniqueId()}`;
  const groupNode: CustomGroupNode = {
     id: groupId,
     type: 'customGroup',
     position: { x: groupX, y: groupY },
     data: {},
     width: groupWidth,
     height: groupHeight,
     style: { width: groupWidth, height: groupHeight },
     selected: true
  };

  const newNodes = state.nodes.map(node => {
     if (state.selectedNodeIds.includes(node.id)) {
        const abs = getAbsPos(node);
        return {
           ...node,
           parentId: groupId,
           position: { x: abs.x - groupX, y: abs.y - groupY },
           selected: false,
        };
     }
     return node;
  });

  // Extremely crucial for React Flow: The parent node MUST appear before its children in the nodes map
  // Placing groupNode at the very beginning guarantees it renders behind and evaluates its bounds before its descendants.
  return { nodes: [groupNode, ...newNodes], selectedNodeIds: [groupId] };
};

export const ungroupAction = (state: EditorStoreType): Partial<EditorStoreType> => {
   if (state.selectedNodeIds.length !== 1) return {};
   const groupId = state.selectedNodeIds[0];
   const groupNode = state.nodes.find(n => n.id === groupId);
   if (!groupNode || groupNode.type !== 'customGroup') return {};

   const newNodes = state.nodes.filter(n => n.id !== groupId).map(node => {
      if (node.parentId === groupId) {
         const newNode = {
            ...node,
            position: {
               x: node.position.x + groupNode.position.x,
               y: node.position.y + groupNode.position.y
            },
            selected: false
         };
         if (groupNode.parentId) {
             newNode.parentId = groupNode.parentId;
         } else {
             delete newNode.parentId;
         }
         return newNode;
      }
      return node;
   });

   return { nodes: newNodes, selectedNodeIds: [] };
};

export const moveAnchorNodeAction = (
  state: EditorStoreType,
  id: string,
  newAbsPos: { x: number; y: number }
): Partial<EditorStoreType> => {
  const newNodes = state.nodes.map((node) => {
    if (node.id === id && node.type === 'anchor') {
      const snapPoint = calculateSnapTarget(newAbsPos, state.nodes);
      return {
        ...node,
        position: { x: snapPoint.x, y: snapPoint.y },
        parentId: snapPoint.snappedParentId,
        data: {
          ...node.data,
          handlePosition: snapPoint.handlePosition,
        },
      } as AppNode;
    }
    return node;
  });
  return { nodes: newNodes };
};
