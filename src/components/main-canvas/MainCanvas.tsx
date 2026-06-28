import {
  ConnectionMode,
  ReactFlow,
  SelectionMode,
} from "@xyflow/react";

import { sidebarTools } from "../../constant";
import { useEditorStore } from "../../store/editor-store";

import ConnectionLine from "../connection-line/ConnectionLine";
import ConnectableArrow from "../custom-edges/connectable-arrow/ConnectableArrow";
import AnchorNode from "../custom-nodes/AnchorNode";
import EllipseNode from "../custom-nodes/ellipse/EllipseNode";
import RectangleNode from "../custom-nodes/rectangle/RectangleNode";
import GroupNode from "../custom-nodes/group/GroupNode";
import TextNode from "../custom-nodes/text/TextNode";
import ActionBar from "../action-bar/ActionBar";
import ZoomControls from "../zoom-controls/ZoomControls";

import { useCanvasInteractions } from "../../hooks/useCanvasInteractions";
import { useNodeChanges } from "../../hooks/useNodeChanges";

const nodeTypes = {
  rectangle: RectangleNode,
  ellipse: EllipseNode,
  anchor: AnchorNode,
  customGroup: GroupNode,
  text: TextNode,
};

const edgeTypes = {
  connectableArrow: ConnectableArrow,
};

const MainCanvas: React.FC = () => {
  const { activeTool, nodes, edges, onEdgesChange, onConnect, commitHistory } = useEditorStore();

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useCanvasInteractions();
  const { handleNodeChange } = useNodeChanges();

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodesChange={handleNodeChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={() => commitHistory()}
        connectionMode={ConnectionMode.Loose}
        connectionLineComponent={ConnectionLine}
        proOptions={{ hideAttribution: true }}

        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}

        className={`tool-${activeTool}`}

        panOnDrag={activeTool === sidebarTools.PAN_ZOOM}
        nodesDraggable={activeTool === sidebarTools.SELECT}
        selectionOnDrag={activeTool === sidebarTools.SELECT}
        selectionMode={SelectionMode.Partial}
        panOnScroll={true}
        minZoom={0.1}
        maxZoom={4.0}
      >
        <ZoomControls />
      </ReactFlow>
      <ActionBar />
    </>
  );
};

export default MainCanvas;