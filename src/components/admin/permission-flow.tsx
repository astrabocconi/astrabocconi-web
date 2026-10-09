"use client";

// Port of astra-app's team permission editor (apps/web/app/dashboard/team/
// permission-flow.tsx): one band per area of the site, its permissions laid
// along it as tappable nodes. Fixed grid, so the same account always draws the
// same picture, and every canvas interaction is off: this is a checklist drawn
// as a diagram, not a canvas. Node types live at module scope so React Flow
// does not remount them on every render.

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from "@/lib/auth/permissions";

const BAND_H = 104;
const BAND_GAP = 10;
const LABEL_W = 168;
const ITEM_W = 210;
const ITEM_H = 72;
const ITEM_GAP = 16;
const PAD = 16;
const BRAND = "#04107e";

type BandData = { label: string; count: number; total: number };
type ItemData = { label: string; blurb: string; on: boolean; onToggle: () => void };

function BandNode({ data }: NodeProps) {
  const d = data as unknown as BandData;
  return (
    <div className="flex h-full flex-col justify-center rounded-2xl bg-gray-50 px-4" style={{ width: LABEL_W - PAD }}>
      <span className="text-sm font-semibold text-gray-800">{d.label}</span>
      <span className="text-xs text-gray-400">
        {d.count} di {d.total}
      </span>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}

function ItemNode({ data }: NodeProps) {
  const d = data as unknown as ItemData;
  return (
    <button
      type="button"
      onClick={d.onToggle}
      aria-pressed={d.on}
      className={`flex h-full w-full flex-col justify-center gap-0.5 rounded-2xl border px-3.5 text-left transition-colors ${
        d.on ? "border-astra-primary bg-astra-light" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
      style={{ width: ITEM_W, height: ITEM_H }}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border text-[10px] leading-none font-bold ${
            d.on ? "border-astra-primary bg-astra-primary text-white" : "border-gray-300 bg-white text-transparent"
          }`}
        >
          ✓
        </span>
        <span className={`truncate text-sm font-semibold ${d.on ? "text-astra-primary" : "text-gray-700"}`}>{d.label}</span>
      </span>
      <span className="truncate text-xs text-gray-400">{d.blurb}</span>
      <Handle type="target" position={Position.Left} className="!opacity-0" />
    </button>
  );
}

const NODE_TYPES = { band: BandNode, item: ItemNode };

export function PermissionFlow({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const selected = useMemo(() => new Set(value), [value]);

  const { nodes, edges, height } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    PERMISSION_GROUPS.forEach((group, row) => {
      const y = row * (BAND_H + BAND_GAP);
      const bandId = `band:${group.key}`;
      nodes.push({
        id: bandId,
        type: "band",
        position: { x: 0, y },
        data: { label: group.label, count: group.items.filter((i) => selected.has(i.key)).length, total: group.items.length },
        draggable: false,
        selectable: false,
        style: { width: LABEL_W - PAD, height: BAND_H - PAD },
      });

      group.items.forEach((item, col) => {
        const id = `item:${item.key}`;
        nodes.push({
          id,
          type: "item",
          position: { x: LABEL_W + col * (ITEM_W + ITEM_GAP), y: y + (BAND_H - PAD - ITEM_H) / 2 },
          data: {
            label: item.label,
            blurb: item.blurb,
            on: selected.has(item.key),
            onToggle: () => {
              if (disabled) return;
              const next = new Set(selected);
              if (next.has(item.key)) next.delete(item.key);
              else next.add(item.key);
              onChange(ALL_PERMISSIONS.filter((k) => next.has(k)));
            },
          },
          draggable: false,
          selectable: false,
          // React Flow switches pointer events off for a node that is neither
          // selectable, draggable nor connectable; this puts them back.
          style: { pointerEvents: "all" },
        });
        edges.push({
          id: `${bandId}->${id}`,
          source: bandId,
          target: id,
          type: "smoothstep",
          style: { stroke: selected.has(item.key) ? BRAND : "#e5e7eb", strokeWidth: 1.5 },
        });
      });
    });

    return { nodes, edges, height: PERMISSION_GROUPS.length * (BAND_H + BAND_GAP) + PAD };
  }, [selected, onChange, disabled]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white ${disabled ? "pointer-events-none opacity-60" : ""}`}
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.04, maxZoom: 1 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#eef0f4" />
      </ReactFlow>
    </div>
  );
}
