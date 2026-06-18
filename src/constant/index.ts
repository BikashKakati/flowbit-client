import type { Node, Edge } from "@xyflow/react";
import {
    GitBranch,
    FolderPlus,
    PenTool,
    Share2,
    Sparkles,
    Users2,
    Download
} from "lucide-react";
import { type ShapeNode } from "../types";
import type { SidebarTools } from "../types/sidebar-types";

export const tempNodes: ShapeNode[] = []

export const sidebarTools: SidebarTools = {
    SELECT: "select",
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    ARROW: "arrow",
    PAN_ZOOM: "pan_zoom"
}

export const DEBOUNCE_DELAY = 2000;
export const COLORS = ['transparent', '#ffffff', '#f1f5f9', '#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#c4b5fd', '#cbd5e1', '#334155'];

export const HERO_CANVAS_NODES: Node[] = [
    { id: "1", type: "hero", position: { x: 30, y: 120 }, data: { label: "Auth Service", color: "indigo" } },
    { id: "2", type: "hero", position: { x: 250, y: 40 }, data: { label: "API Gateway", color: "violet" } },
    { id: "3", type: "hero", position: { x: 250, y: 200 }, data: { label: "Rate Limiter", color: "cyan" } },
    { id: "4", type: "hero", position: { x: 470, y: 120 }, data: { label: "User Service", color: "indigo" } },
    { id: "5", type: "hero", position: { x: 470, y: 280 }, data: { label: "Cache Layer", color: "violet" } },
];

export const HERO_CANVAS_EDGES: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#22d3ee", strokeWidth: 2 } },
    { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "#8b5cf6", strokeWidth: 2 } },
    { id: "e3-5", source: "3", target: "5", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
];

export const HERO_COLOR_MAP: Record<string, { border: string; glow: string; dot: string }> = {
    indigo: { border: "border-indigo-500/60", glow: "shadow-[0_0_18px_rgba(99,102,241,0.35)]", dot: "bg-indigo-400" },
    violet: { border: "border-violet-500/60", glow: "shadow-[0_0_18px_rgba(139,92,246,0.35)]", dot: "bg-violet-400" },
    cyan: { border: "border-cyan-500/60", glow: "shadow-[0_0_18px_rgba(34,211,238,0.35)]", dot: "bg-cyan-400" },
};

export const FEATURES_LIST = [
    {
        tag: "Canvas",
        icon: GitBranch,
        iconColor: "text-indigo-400",
        tagColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        title: "Node-based canvas that thinks like a developer",
        body: "Drag, connect, and arrange nodes with precision. Every element snaps to a grid, edges route intelligently, and your layout stays readable no matter how complex the system.",
        bullets: ["Animated directed edges", "Bezier and straight connectors", "Multi-select and bulk operations"],
        visualKey: "nodes",
        visualLeft: false,
    },
    {
        tag: "Grouping",
        icon: Sparkles,
        iconColor: "text-violet-400",
        tagColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        title: "Frames and groups for structured thinking",
        body: "Nest related nodes inside labelled frames. Collapse entire sub-systems into a single node. Zoom in to the detail, zoom out to the strategy — without losing context.",
        bullets: ["Infinitely nestable groups", "Collapsible sub-flows", "Auto-resizing frames"],
        visualKey: "grouping",
        visualLeft: true,
    },
    {
        tag: "Collaboration",
        icon: Users2,
        iconColor: "text-cyan-400",
        tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        title: "Live multiplayer — see every cursor, every edit",
        body: "Multiple engineers can edit the same canvas simultaneously. Presence indicators, named cursors, and conflict-free real-time sync mean nobody's changes disappear.",
        bullets: ["Real-time presence cursors", "Named collaborator avatars", "Conflict-free sync (CRDT)"],
        visualKey: "collaboration",
        visualLeft: false,
    },
    {
        tag: "Export",
        icon: Download,
        iconColor: "text-indigo-400",
        tagColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        title: "Export to any format your workflow needs",
        body: "One click to SVG for design handoff, PNG for documentation, JSON for version control, or PDF for stakeholder decks. Your diagrams live everywhere your team does.",
        bullets: ["SVG, PNG, PDF, JSON", "Embed in Notion, Confluence", "Public share links"],
        visualKey: "export",
        visualLeft: true,
    },
];

export const COLLABORATION_CURSORS = [
    { name: "AK", x: "30%", y: "40%", color: "#6366f1", label: "Adding node..." },
    { name: "SR", x: "60%", y: "60%", color: "#a78bfa", label: "Editing label" },
    { name: "TM", x: "70%", y: "25%", color: "#22d3ee", label: "" },
];

export const EXPORT_FORMATS = [
    { ext: "SVG", color: "#6366f1", size: "12 KB" },
    { ext: "PNG", color: "#8b5cf6", size: "48 KB" },
    { ext: "JSON", color: "#22d3ee", size: "4 KB" },
    { ext: "PDF", color: "#a78bfa", size: "92 KB" },
];

export const HOW_IT_WORKS_STEPS = [
    {
        number: "01",
        icon: FolderPlus,
        iconColor: "text-indigo-400",
        iconBg: "bg-indigo-500/10 border-indigo-500/20",
        title: "Create a space",
        body: "Open Flowsbit and create a new workspace. Name it after your project — monorepo, microservice, team API.",
    },
    {
        number: "02",
        icon: PenTool,
        iconColor: "text-violet-400",
        iconBg: "bg-violet-500/10 border-violet-500/20",
        title: "Build your diagram",
        body: "Drop nodes, draw connections, label edges. Use frames to group clusters. Everything auto-saves as you go.",
    },
    {
        number: "03",
        icon: Share2,
        iconColor: "text-cyan-400",
        iconBg: "bg-cyan-500/10 border-cyan-500/20",
        title: "Share or export",
        body: "Invite teammates to edit live, or export to SVG, PNG, or PDF for docs, decks, and design handoffs.",
    },
];

export const SOCIAL_PROOF_TESTIMONIALS = [
    {
        quote:
            "We replaced four different tools — Miro, draw.io, Notion diagrams, and Lucidchart — with Flowsbit. Now every service diagram lives in one place, everyone can edit it live, and it actually looks like what's running in prod.",
        name: "Priya Nair",
        role: "Staff Engineer",
        company: "Ramp",
        initials: "PN",
        accentColor: "#6366f1",
    },
    {
        quote:
            "The node-based canvas is the right abstraction for system architecture. I can map out a distributed system in 20 minutes, share a link, and async review it with the team before any infra decision is made.",
        name: "Daniel Reeves",
        role: "Platform Architect",
        company: "Vercel",
        initials: "DR",
        accentColor: "#8b5cf6",
    },
    {
        quote:
            "My team uses it for both technical architecture and product thinking. Frames let us zoom from the full system to a single service without losing context. It's become our default thinking surface.",
        name: "Sana Cheema",
        role: "Engineering Manager",
        company: "Stripe",
        initials: "SC",
        accentColor: "#22d3ee",
    },
];

export const CTA_STATS = [
    { value: "12,000+", label: "diagrams built" },
    { value: "Free", label: "to start" },
    { value: "< 2 min", label: "to first diagram" },
];