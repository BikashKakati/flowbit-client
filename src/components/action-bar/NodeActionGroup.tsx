import { PaintBucket, Pen, Trash2, Minus, Plus, Type } from 'lucide-react';
import React from 'react';
import { useEditorStore } from '../../store/editor-store';
import { ColorPalette } from '../common/ColorPalette';

const NodeActionGroup: React.FC<{ nodeIds: string[] }> = ({ nodeIds }) => {
    const { nodes, updateShapeNode, deleteElements } = useEditorStore();

    const handleBgColor = (color: string) => {
        nodeIds.forEach(id => updateShapeNode(id, { bgColor: color }));
    };

    const handleBorderColor = (color: string) => {
        nodeIds.forEach(id => updateShapeNode(id, { borderColor: color }));
    };

    const handleTextColor = (color: string) => {
        nodeIds.forEach(id => updateShapeNode(id, { textColor: color }));
    };

    const handleDelete = () => {
        deleteElements(nodeIds, 'node');
    };

    const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
    const firstNode = selectedNodes[0];
    const displayFontSize = (firstNode?.data as any)?.fontSize ?? 14;

    const handleIncreaseFontSize = () => {
        nodeIds.forEach(id => {
            const node = nodes.find(n => n.id === id);
            const currentSize = (node?.data as any)?.fontSize ?? 14;
            updateShapeNode(id, { fontSize: Math.min(120, currentSize + 2) });
        });
    };

    const handleDecreaseFontSize = () => {
        nodeIds.forEach(id => {
            const node = nodes.find(n => n.id === id);
            const currentSize = (node?.data as any)?.fontSize ?? 14;
            updateShapeNode(id, { fontSize: Math.max(8, currentSize - 2) });
        });
    };

    const isTextNodeOnly = selectedNodes.length > 0 && selectedNodes.every(n => n.type === 'text');

    return (
        <div className="flex items-center gap-1">
            {!isTextNodeOnly && (
                <>
                    <ColorPalette icon={PaintBucket} label="Fill Color" onColorSelect={handleBgColor} />
                    <ColorPalette icon={Pen} label="Border Color" onColorSelect={handleBorderColor} darkenFactor={0.8} />
                </>
            )}
            <ColorPalette icon={Type} label="Text Color" onColorSelect={handleTextColor} />

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-slate-100 border border-slate-250/30">
                <button
                    onClick={handleDecreaseFontSize}
                    className="p-1 hover:bg-slate-200 hover:text-slate-900 text-slate-600 rounded-lg transition-colors"
                    title="Decrease Font Size"
                >
                    <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="text-xs font-semibold text-slate-700 min-w-[32px] text-center select-none">
                    {displayFontSize}px
                </span>
                <button
                    onClick={handleIncreaseFontSize}
                    className="p-1 hover:bg-slate-200 hover:text-slate-900 text-slate-600 rounded-lg transition-colors"
                    title="Increase Font Size"
                >
                    <Plus size={14} strokeWidth={2.5} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            <button
                onClick={handleDelete}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
                title="Delete Node(s)"
            >
                <Trash2 size={18} strokeWidth={2} />
            </button>
        </div>
    );
};

export default NodeActionGroup;
