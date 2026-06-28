import { ReactFlowProvider } from "@xyflow/react";
import { ArrowLeft, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FlowService } from "../../services/api/flow-service";
import MainCanvas from "../../components/main-canvas/MainCanvas";
import Sidebar from "../../components/sidebar/Sidebar";
import { CanvasService } from "../../services/api/canvas-service";
import { useEditorStore } from "../../store/editor-store";
import { useWorkspaceStore } from "../../store/workspace-store";
import { DEBOUNCE_DELAY } from "../../constant";
import FlowbitLoader from "../../components/common/FlowbitLoader";

const FlowbitCanvasPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        initializeCanvasData, setActiveFlow: setActiveFlowHistory,
        undoHistory: undo,
        redoHistory: redo,
        copyElements,
        cutElements,
        pasteElements,
        selectedNodeIds,
        selectedEdgeIds,
        deleteElements
    } = useEditorStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const flowMetadata = id ? useWorkspaceStore((state) => state.getFlowById(id)) : undefined;
    const flowName = flowMetadata?.name || "Flow";
    const updateFlow = useWorkspaceStore((state) => state.updateFlow);
    const deleteFlow = useWorkspaceStore((state) => state.deleteFlow);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editingNameValue, setEditingNameValue] = useState(flowName);

    useEffect(() => {
        setEditingNameValue(flowName);
    }, [flowName]);

    const handleSaveName = async () => {
        if (!id || !editingNameValue.trim()) {
            setIsEditingName(false);
            return;
        }

        const trimmed = editingNameValue.trim();
        if (trimmed === flowName) {
            setIsEditingName(false);
            return;
        }

        updateFlow(id, trimmed);
        setIsEditingName(false);

        try {
            await FlowService.updateFlowName(id, trimmed);
        } catch (err) {
            console.error("Failed to update flow name", err);
        }
    };

    const handleDeleteFlow = async () => {
        if (!id) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this flow?");
        if (!confirmDelete) return;

        deleteFlow(id);
        navigate("/space");

        try {
            await FlowService.deleteFlow(id);
        } catch (err) {
            console.error("Failed to delete flow", err);
        }
    };

    useEffect(() => {
        if (!id) {
            navigate("/space");
            return;
        }

        const loadCanvas = async () => {
            try {
                const canvas = await CanvasService.getCanvasContent(id);

                initializeCanvasData((canvas.nodes as any[]) || [], (canvas.edges as any[]) || []);
                setActiveFlowHistory(id);
                setIsLoading(false);
            } catch (err) {
                console.error("Canvas fetch error", err);
                navigate("/space");
            }
        };
        loadCanvas();
    }, [id, navigate, initializeCanvasData, setActiveFlowHistory]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeElement = document.activeElement;
            if (
                activeElement &&
                (activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.getAttribute('contenteditable') === 'true')
            ) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isMod = isMac ? e.metaKey : e.ctrlKey;

            if (isMod && !e.shiftKey && e.key === 'z') {
                e.preventDefault();
                undo();
            } else if (isMod && e.key === 'y') {
                e.preventDefault();
                redo();
            } else if (isMod && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                copyElements();
            } else if (isMod && (e.key === 'x' || e.key === 'X')) {
                e.preventDefault();
                cutElements();
            } else if (isMod && (e.key === 'v' || e.key === 'V')) {
                e.preventDefault();
                pasteElements();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedNodeIds.length > 0) {
                    deleteElements(selectedNodeIds, 'node');
                } else if (selectedEdgeIds.length > 0) {
                    deleteElements(selectedEdgeIds, 'edge');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, copyElements, cutElements, pasteElements, selectedNodeIds, selectedEdgeIds, deleteElements]);

    useEffect(() => {
        if (!id || isLoading) return;

        const unsub = useEditorStore.subscribe((state, prevState) => {
            // Check if actual diagram components changed
            if (JSON.stringify(state.nodes) === JSON.stringify(prevState.nodes) && JSON.stringify(state.edges) === JSON.stringify(prevState.edges)) return;

            setIsSaving(true);
            CanvasService.saveCanvasContentDebounced(id, state.nodes as any, state.edges as any, DEBOUNCE_DELAY, () => {
                setIsSaving(false);
            });
        });

        return () => {
            unsub();
        }
    }, [id, isLoading]);

    if (isLoading) {
        return <FlowbitLoader message="Loading canvas..." />;
    }

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-50 to-indigo-50 relative overflow-hidden"
            style={{
                backgroundImage: `
          linear-gradient(to bottom right, var(--tw-gradient-stops)),
          linear-gradient(to right, #e2e8f0 1px, transparent 1px),
          linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
        `,
                backgroundSize: '100% 100%, 24px 24px, 24px 24px',
                backgroundColor: '#f8fafc'
            }}
        >
            <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
                <Link to="/space" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Spaces
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 group/header-name">
                    <div className="flex items-center gap-1.5">
                        {isEditingName ? (
                            <input
                                type="text"
                                className="bg-transparent border-b border-indigo-500/50 rounded-none px-1 py-0.5 text-slate-950 focus:outline-none focus:border-indigo-500 focus:ring-0 font-semibold max-w-[100px] text-sm"
                                value={editingNameValue}
                                onChange={(e) => setEditingNameValue(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveName();
                                    } else if (e.key === 'Escape') {
                                        setIsEditingName(false);
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            <p
                                className="font-semibold text-slate-900 cursor-text px-1 py-0.5 border-b border-transparent hover:border-indigo-500/50 hover:bg-slate-50 transition-all duration-200 block max-w-[150px] truncate"
                                onClick={() => {
                                    setEditingNameValue(flowName);
                                    setIsEditingName(true);
                                }}
                                title="Click to rename"
                            >
                                {flowName}
                            </p>
                        )}
                        <button
                            onClick={handleDeleteFlow}
                            className={`text-slate-400 hover:text-rose-600 p-0.5 rounded transition-all border-l border-slate-200 pl-1.5 shrink-0 ${isEditingName ? "opacity-100" : "opacity-0 group-hover/header-name:opacity-100"}`}
                            title="Delete flow"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="border-l border-slate-200 pl-2 ml-1 flex items-center shrink-0">
                        {isSaving ? (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Saved</span>
                        )}
                    </div>
                </div>
            </div>

            <ReactFlowProvider>
                <Sidebar />
                <MainCanvas />
            </ReactFlowProvider>
        </div>
    )
}

export default FlowbitCanvasPage