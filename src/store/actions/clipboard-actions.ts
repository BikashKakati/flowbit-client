import type { AppNode, CustomEdge } from '../../types';
import type { EditorStoreType } from '../../types/store-types';
import { getUniqueId } from '../../utils';

export const copyElementsAction = (state: EditorStoreType): Partial<EditorStoreType> => {
  if (state.selectedNodeIds.length === 0 && state.selectedEdgeIds.length === 0) {
    return {};
  }

  // 1. Gather all nodes to copy, including customGroup descendants
  const getDescendants = (parentId: string): string[] => {
    let desc: string[] = [];
    state.nodes.forEach((n) => {
      if (n.parentId === parentId) {
        desc.push(n.id);
        desc = desc.concat(getDescendants(n.id));
      }
    });
    return desc;
  };

  let allNodeIdsToCopy = [...state.selectedNodeIds];
  state.selectedNodeIds.forEach((id) => {
    allNodeIdsToCopy = allNodeIdsToCopy.concat(getDescendants(id));
  });
  allNodeIdsToCopy = [...new Set(allNodeIdsToCopy)];

  // 2. Gather all edges to copy
  // Copy selected edges + any edges connecting the copied nodes
  const copiedEdges = state.edges.filter((e) =>
    state.selectedEdgeIds.includes(e.id) ||
    (allNodeIdsToCopy.includes(e.source) && allNodeIdsToCopy.includes(e.target))
  );

  // 3. For any copied edge, we MUST copy its source and target nodes (anchor nodes)
  // so that the duplicated edge connects to duplicate anchor nodes, not the original ones!
  copiedEdges.forEach((e) => {
    if (!allNodeIdsToCopy.includes(e.source)) {
      allNodeIdsToCopy.push(e.source);
    }
    if (!allNodeIdsToCopy.includes(e.target)) {
      allNodeIdsToCopy.push(e.target);
    }
  });

  // Unique set of node IDs after adding edge source and target anchor nodes
  const finalNodeIdsToCopy = [...new Set(allNodeIdsToCopy)];
  const copiedNodes = state.nodes.filter((n) => finalNodeIdsToCopy.includes(n.id));

  return {
    copiedNodeIds: finalNodeIdsToCopy,
    copiedEdgeIds: copiedEdges.map((e) => e.id),
    cutNodeIds: [],
    cutEdgeIds: [],
    clipboard: {
      nodes: copiedNodes,
      edges: copiedEdges,
      action: 'copy',
    },
  };
};

export const cutElementsAction = (state: EditorStoreType): Partial<EditorStoreType> => {
  if (state.selectedNodeIds.length === 0 && state.selectedEdgeIds.length === 0) {
    return {};
  }

  // 1. Gather all nodes to copy, including customGroup descendants
  const getDescendants = (parentId: string): string[] => {
    let desc: string[] = [];
    state.nodes.forEach((n) => {
      if (n.parentId === parentId) {
        desc.push(n.id);
        desc = desc.concat(getDescendants(n.id));
      }
    });
    return desc;
  };

  let allNodeIdsToCopy = [...state.selectedNodeIds];
  state.selectedNodeIds.forEach((id) => {
    allNodeIdsToCopy = allNodeIdsToCopy.concat(getDescendants(id));
  });
  allNodeIdsToCopy = [...new Set(allNodeIdsToCopy)];

  // 2. Gather all edges to copy
  const cutEdges = state.edges.filter((e) =>
    state.selectedEdgeIds.includes(e.id) ||
    (allNodeIdsToCopy.includes(e.source) && allNodeIdsToCopy.includes(e.target))
  );

  // 3. For any cut edge, we MUST cut its source and target nodes (anchor nodes)
  cutEdges.forEach((e) => {
    if (!allNodeIdsToCopy.includes(e.source)) {
      allNodeIdsToCopy.push(e.source);
    }
    if (!allNodeIdsToCopy.includes(e.target)) {
      allNodeIdsToCopy.push(e.target);
    }
  });

  const finalNodeIdsToCopy = [...new Set(allNodeIdsToCopy)];
  const cutNodes = state.nodes.filter((n) => finalNodeIdsToCopy.includes(n.id));

  return {
    copiedNodeIds: [],
    copiedEdgeIds: [],
    cutNodeIds: finalNodeIdsToCopy,
    cutEdgeIds: cutEdges.map((e) => e.id),
    clipboard: {
      nodes: cutNodes,
      edges: cutEdges,
      action: 'cut',
    },
  };
};

export const pasteElementsAction = (state: EditorStoreType): Partial<EditorStoreType> => {
  if (!state.clipboard) {
    return {};
  }

  const { nodes: clipNodes, edges: clipEdges, action } = state.clipboard;

  if (action === 'copy') {
    // 1. Map old IDs to new IDs
    const idMap = new Map<string, string>();
    const clipNodeIds = clipNodes.map((n) => n.id);

    clipNodes.forEach((node) => {
      idMap.set(node.id, getUniqueId());
    });

    // 2. Duplicate nodes
    const duplicatedNodes = clipNodes.map((node) => {
      const newId = idMap.get(node.id)!;
      
      const hasCopiedParent = node.parentId && clipNodeIds.includes(node.parentId);
      const newParentId = node.parentId 
        ? (hasCopiedParent ? idMap.get(node.parentId) : node.parentId) 
        : undefined;

      const isRoot = !node.parentId || !clipNodeIds.includes(node.parentId);
      const newPosition = isRoot
        ? { x: node.position.x + 40, y: node.position.y + 40 }
        : node.position;

      return {
        ...node,
        id: newId,
        parentId: newParentId,
        position: newPosition,
        selected: true,
      } as AppNode;
    });

    // 3. Duplicate edges
    const duplicatedEdges = clipEdges.map((edge) => {
      const newEdgeId = `edge-${getUniqueId()}`;
      return {
        ...edge,
        id: newEdgeId,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
        selected: true,
      } as CustomEdge;
    });

    // Deselect all existing nodes & edges
    const deselectedNodes = state.nodes.map((n) => ({ ...n, selected: false }));
    const deselectedEdges = state.edges.map((e) => ({ ...e, selected: false }));

    const nextNodes = [...deselectedNodes, ...duplicatedNodes];
    const nextEdges = [...deselectedEdges, ...duplicatedEdges];

    // Shift clipboard positions by 40,40 in case user pastes again (cascading offset)
    const shiftedClipboardNodes = clipNodes.map((node) => {
      const isRoot = !node.parentId || !clipNodeIds.includes(node.parentId);
      return {
        ...node,
        position: isRoot
          ? { x: node.position.x + 40, y: node.position.y + 40 }
          : node.position,
      } as AppNode;
    });

    return {
      nodes: nextNodes,
      edges: nextEdges,
      selectedNodeIds: duplicatedNodes.map((n) => n.id),
      selectedEdgeIds: duplicatedEdges.map((e) => e.id),
      copiedNodeIds: [], // Clear visual highlighting on the first paste!
      copiedEdgeIds: [], // Clear visual highlighting on the first paste!
      clipboard: {
        nodes: shiftedClipboardNodes,
        edges: clipEdges,
        action: 'copy',
      },
    };
  } else {
    // Cut action: move elements by +40, +40 and reset cut highlight
    const cutNodeIdsSet = new Set(clipNodes.map((n) => n.id));

    const nextNodes = state.nodes.map((node) => {
      if (cutNodeIdsSet.has(node.id)) {
        const isRoot = !node.parentId || !cutNodeIdsSet.has(node.parentId);
        const newPosition = isRoot
          ? { x: node.position.x + 40, y: node.position.y + 40 }
          : node.position;

        return {
          ...node,
          position: newPosition,
          selected: true,
        } as AppNode;
      }
      return { ...node, selected: false };
    });

    const cutEdgeIdsSet = new Set(clipEdges.map((e) => e.id));
    const nextEdges = state.edges.map((edge) => {
      if (cutEdgeIdsSet.has(edge.id)) {
        return {
          ...edge,
          selected: true,
        } as CustomEdge;
      }
      return { ...edge, selected: false };
    });

    return {
      nodes: nextNodes,
      edges: nextEdges,
      selectedNodeIds: clipNodes.map((n) => n.id),
      selectedEdgeIds: clipEdges.map((e) => e.id),
      copiedNodeIds: [],
      copiedEdgeIds: [],
      cutNodeIds: [],
      cutEdgeIds: [],
      clipboard: null, // Clear clipboard after cut paste
    };
  }
};
