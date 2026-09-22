"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { useMemo, useState } from "react";

export type DecisionRow = {
  id: string;
  agent: string;
  action: string;
  decision:
    | "ALLOW"
    | "BLOCK"
    | "ESCALATE";
  status: string;
  evidence: string;
  time: string;
};

type SortKey = keyof DecisionRow;

export function DecisionTable({
  rows,
}: {
  rows: DecisionRow[];
}) {
  const [sortKey, setSortKey] =
    useState<SortKey>("time");

  const [descending, setDescending] =
    useState(true);

  function toggleSort(
    key: SortKey,
  ) {
    if (sortKey === key) {
      setDescending(
        (value) => !value,
      );
      return;
    }

    setSortKey(key);
    setDescending(false);
  }

  const sortedRows =
    useMemo(() => {
      const copy =
        [...rows];

      copy.sort(
        (a, b) => {
          const av =
            String(a[sortKey]);

          const bv =
            String(b[sortKey]);

          const result =
            av.localeCompare(
              bv,
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              },
            );

          return descending
            ? -result
            : result;
        },
      );

      return copy;
    }, [
      rows,
      sortKey,
      descending,
    ]);

  function SortIcon({
    column,
  }: {
    column: SortKey;
  }) {
    if (sortKey !== column) {
      return (
        <ArrowUpDown
          size={11}
          strokeWidth={1.6}
        />
      );
    }

    return descending ? (
      <ArrowDown
        size={11}
        strokeWidth={1.7}
      />
    ) : (
      <ArrowUp
        size={11}
        strokeWidth={1.7}
      />
    );
  }

  const columns: Array<{
    key: SortKey;
    label: string;
  }> = [
    {
      key: "id",
      label: "Decision",
    },
    {
      key: "agent",
      label: "Agent",
    },
    {
      key: "action",
      label: "Action",
    },
    {
      key: "decision",
      label: "Decision",
    },
    {
      key: "status",
      label: "Enforcement",
    },
    {
      key: "evidence",
      label: "Evidence",
    },
    {
      key: "time",
      label: "Time",
    },
  ];

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(
              (column) => (
                <th
                  key={column.key}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleSort(
                        column.key,
                      )
                    }
                    style={{
                      border: 0,
                      padding: 0,
                      background:
                        "transparent",
                      color:
                        "inherit",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: 5,
                      fontSize:
                        "inherit",
                      fontWeight:
                        "inherit",
                      textTransform:
                        "inherit",
                      letterSpacing:
                        "inherit",
                    }}
                  >
                    {column.label}
                    <SortIcon
                      column={
                        column.key
                      }
                    />
                  </button>
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {sortedRows.map(
            (row) => {
              const decisionClass =
                row.decision ===
                "ALLOW"
                  ? "decision-pill decision-allow"
                  : row.decision ===
                    "BLOCK"
                    ? "decision-pill decision-block"
                    : "decision-pill decision-escalate";

              return (
                <tr
                  key={row.id}
                >
                  <td>
                    <span
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color:
                          "#9bb0c4",
                        fontSize:
                          10,
                      }}
                    >
                      {row.id}
                    </span>
                  </td>

                  <td>
                    {row.agent}
                  </td>

                  <td>
                    {row.action}
                  </td>

                  <td>
                    <span
                      className={
                        decisionClass
                      }
                    >
                      {row.decision}
                    </span>
                  </td>

                  <td>
                    {row.status}
                  </td>

                  <td>
                    <span
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color:
                          "#7e93a8",
                        fontSize:
                          10,
                      }}
                    >
                      {row.evidence}
                    </span>
                  </td>

                  <td>
                    {row.time}
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}