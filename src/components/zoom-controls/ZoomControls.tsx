import React, { useCallback } from 'react';
import { Panel, useReactFlow, useViewport } from '@xyflow/react';
import { Minus, Plus, Undo2, Redo2 } from 'lucide-react';
import { useEditorStore } from '../../store/editor-store';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4.0;

const ZoomControls: React.FC = () => {
    const { zoomIn, zoomOut, zoomTo } = useReactFlow();
    const { zoom } = useViewport();
    const { undoHistory: undo, redoHistory: redo, past, future } = useEditorStore();

    const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
    const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
    const handleResetZoom = useCallback(() => zoomTo(1, { duration: 200 }), [zoomTo]);

    const zoomPercentage = Math.round(zoom * 100);

    return (
        <Panel position="bottom-right" className="m-6">
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/60 p-1.5 rounded-xl transition-all">
                <button
                    onClick={undo}
                    disabled={past?.length === 0}
                    className="w-8 h-8 flex flex-col items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={16} strokeWidth={2.5} />
                </button>

                <button
                    onClick={redo}
                    disabled={future?.length === 0}
                    className="w-8 h-8 flex flex-col items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 size={16} strokeWidth={2.5} />
                </button>

                <div className="w-[1px] h-6 bg-slate-200 mx-0.5" />

                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="w-8 h-8 flex flex-col items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Zoom Out"
                >
                    <Minus size={16} strokeWidth={2.5} />
                </button>

                <div className="w-[1px] h-6 bg-slate-200 mx-0.5" />

                <button
                    onClick={handleResetZoom}
                    className="w-16 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-100 transition-all font-mono"
                    title="Reset Zoom to 100%"
                >
                    {zoomPercentage}%
                </button>

                <div className="w-[1px] h-6 bg-slate-200 mx-0.5" />

                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="w-8 h-8 flex flex-col items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Zoom In"
                >
                    <Plus size={16} strokeWidth={2.5} />
                </button>
            </div>
        </Panel>
    );
};

export default ZoomControls;
