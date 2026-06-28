import type React from "react";
import { useEditorStore } from "../../store/editor-store";
import { sidebarTools } from "../../constant";
import {
  MousePointer2,
  Square,
  Circle,
  ArrowRight,
  Hand,
  Type
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();

  const tools = [
    { key: sidebarTools.SELECT, icon: MousePointer2, label: 'Select' },
    { key: sidebarTools.RECTANGLE, icon: Square, label: 'Rectangle' },
    { key: sidebarTools.ELLIPSE, icon: Circle, label: 'Ellipse' },
    { key: sidebarTools.ARROW, icon: ArrowRight, label: 'Arrow' },
    { key: sidebarTools.TEXT, icon: Type, label: 'Text' },
    { key: sidebarTools.PAN_ZOOM, icon: Hand, label: 'Pan/Zoom' }
  ];

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 w-12 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-slate-200 flex flex-col items-center gap-2 p-2 z-[9999]">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = activeTool === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setActiveTool(t.key)}
            title={t.label}
            className={`
              w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150
              ${isActive
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
            `}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
