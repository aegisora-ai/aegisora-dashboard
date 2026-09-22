"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export type DecisionRow = {
  id: string;
  agent: string;
  action: string;
  decision: "ALLOW" | "BLOCK" | "ESCALATE";
  status: string;
  evidence: string;
  time: string;
};

const columnHelper = createColumnHelper<DecisionRow>();

const columns = [
  columnHelper.accessor("id", {
    header: "Decision",
  }),
  columnHelper.accessor("agent", {
    header: "Agent",
  }),
  columnHelper.accessor("action", {
    header: "Action",
  }),
  columnHelper.accessor("decision", {
    header: "Decision",
    cell: (info) => {
      const value = info.getValue();
      const className =
        value === "ALLOW"
          ? "decision-pill decision-allow"
          : value === "BLOCK"
            ? "decision-pill decision-block"
            : "decision-pill decision-escalate";

      return (
        <span className={className}>
          {value}
        </span>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Enforcement",
  }),
  columnHelper.accessor("evidence", {
    header: "Evidence",
  }),
  columnHelper.accessor("time", {
    header: "Time",
  }),
];

export function DecisionTable({
  rows,
}: {
  rows: DecisionRow[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: "inherit",
                      fontSize: "inherit",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}

                    {header.column.getIsSorted() === "asc"
                      ? " ↑"
                      : header.column.getIsSorted() === "desc"
                        ? " ↓"
                        : ""}
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}