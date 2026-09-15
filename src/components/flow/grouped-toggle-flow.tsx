"use client";

// The "ReactFlow-as-static-diagram" pattern: one horizontal band per group, with
// that group's items laid out along it as tappable nodes, connected by edges
// colored by selection state. Fixed grid positions (not force-directed), so the
// same data always draws the same picture, and every interaction ReactFlow
// normally offers (drag, pan, zoom, connect) is switched off — this is a
// permissions grid / toggle diagram, not a canvas.
//
// Source: astra-app's team permission editor
// (apps/web/app/dashboard/team/permission-flow.tsx), generalized beyond
// permissions — use it for any "toggle items within named groups, show it as a
// diagram" UI: feature flags by module, notification settings by category, etc.
//
// Requires @xyflow/react. Import "@xyflow/react/dist/style.css" once in the
// consuming app.

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

export interface FlowItem {
  key: string;
  label: string;
  blurb?: string;
}

export interface FlowGroup {
  key: string;
  label: string;
  items: FlowItem[];
}

// Layout constants — override via `layout` prop if a project needs different sizing.
const DEFAULT_LAYOUT = {
  bandHeight: 116,
  bandGap: 12,
  labelWidth: 168,
  itemWidth: 196,
  itemHeight: 76,
  itemGap: 18,
  pad: 16,
};

type BandData = { label: string; count: number; total: number };
type ItemData = { label: string; blurb?: string; on: boolean; onToggle: () => void };

function makeNodeTypes(layout: typeof DEFAULT_LAYOUT, selectedColor: string) {
  function BandNode({ data }: NodeProps) {
    const d = data as unknown as BandData;
    return (
      <div
        className="flex h-full flex-col justify-center rounded-2xl bg-gray-50 px-4"
        style={{ width: layout.labelWidth - layout.pad }}
      >
        <span className="text-sm font-semibold text-gray-800">{d.label}</span>
        <span className="text-xs text-gray-400">
          {d.count} of {d.total}
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
          d.on ? "bg-white" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }`}
        style={{
          width: layout.itemWidth,
          height: layout.itemHeight,
          borderColor: d.on ? selectedColor : undefined,
          backgroundColor: d.on ? `${selectedColor}14` : undefined,
        }}
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold leading-none"
            style={{
              borderColor: d.on ? selectedColor : "#d1d5db",
              backgroundColor: d.on ? selectedColor : "white",
              color: d.on ? "white" : "transparent",
            }}
          >
            ✓
          </span>
          <span className="truncate text-sm font-semibold" style={{ color: d.on ? selectedColor : "#374151" }}>
            {d.label}
          </span>
        </span>
        {d.blurb && <span className="truncate text-xs text-gray-400">{d.blurb}</span>}
        <Handle type="target" position={Position.Left} className="!opacity-0" />
      </button>
    );
  }

  return { band: BandNode, item: ItemNode };
}

export function GroupedToggleFlow({
  groups,
  value,
  onChange,
  disabled = false,
  selectedColor = "#003399",
  layout: layoutOverride,
}: {
  groups: FlowGroup[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  /** Color for selected item borders/edges. Pick your project's primary token. */
  selectedColor?: string;
  layout?: Partial<typeof DEFAULT_LAYOUT>;
}) {
  const layout = { ...DEFAULT_LAYOUT, ...layoutOverride };
  const selected = useMemo(() => new Set(value), [value]);
  const nodeTypes = useMemo(() => makeNodeTypes(layout, selectedColor), [layout, selectedColor]);
  const allKeys = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.key)), [groups]);

  const { nodes, edges, height } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    groups.forEach((group, row) => {
      const y = row * (layout.bandHeight + layout.bandGap);
      const bandId = `band:${group.key}`;
      const on = group.items.filter((i) => selected.has(i.key)).length;

      nodes.push({
        id: bandId,
        type: "band",
        position: { x: 0, y },
        data: { label: group.label, count: on, total: group.items.length },
        draggable: false,
        selectable: false,
        style: { width: layout.labelWidth - layout.pad, height: layout.bandHeight - layout.pad },
      });

      group.items.forEach((item, col) => {
        const id = `item:${item.key}`;
        nodes.push({
          id,
          type: "item",
          position: {
            x: layout.labelWidth + col * (layout.itemWidth + layout.itemGap),
            y: y + (layout.bandHeight - layout.pad - layout.itemHeight) / 2,
          },
          data: {
            label: item.label,
            blurb: item.blurb,
            on: selected.has(item.key),
            onToggle: () => {
              if (disabled) return;
              const next = new Set(selected);
              if (next.has(item.key)) next.delete(item.key);
              else next.add(item.key);
              onChange(allKeys.filter((k) => next.has(k)));
            },
          },
          draggable: false,
          selectable: false,
          // A node that's neither selectable, draggable, nor connectable gets
          // pointer-events switched off by ReactFlow — this restores them so the
          // button inside stays clickable.
          style: { pointerEvents: "all" },
        });

        edges.push({
          id: `${bandId}->${id}`,
          source: bandId,
          target: id,
          type: "smoothstep",
          style: { stroke: selected.has(item.key) ? selectedColor : "#e5e7eb", strokeWidth: 1.5 },
        });
      });
    });

    return { nodes, edges, height: groups.length * (layout.bandHeight + layout.bandGap) + layout.pad };
  }, [groups, selected, onChange, disabled, allKeys, layout, selectedColor]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
