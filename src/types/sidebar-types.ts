import type { Tool } from "./zustand-types"

export type SidebarOption = {
    title: string,
    key: Tool
}

export type SidebarTools = {
    SELECT:Tool,
    RECTANGLE: Tool,
    ELLIPSE:Tool,
    ARROW:Tool,
    PAN_ZOOM:Tool,
    TEXT:Tool
}