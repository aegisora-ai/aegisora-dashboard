"use client";

import { motion } from "motion/react";

const nodes = [
  { x: 95, y: 100, label: "agent", tone: "blue" },
  { x: 260, y: 75, label: "context", tone: "cyan" },
  { x: 430, y: 120, label: "policy", tone: "blue" },
  { x: 585, y: 87, label: "risk", tone: "cyan" },
  { x: 410, y: 265, label: "decision", tone: "blue" },
  { x: 595, y: 290, label: "evidence", tone: "cyan" },
  { x: 230, y: 330, label: "execution", tone: "blue" },
];

const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 4],
  [4, 5],
  [4, 6],
  [6, 5],
];

export function RuntimeCanvas() {
  return (
    <div className="hero-canvas-frame">
      <svg
        viewBox="0 0 680 430"
        width="100%"
        height="100%"
        role="img"
        aria-label="Aegisora runtime enforcement canvas"
      >
        <defs>
          <linearGradient id="lineBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#65d6ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#65d6ff" stopOpacity="0.8" />
          </linearGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="1"
          y="1"
          width="678"
          height="428"
          rx="22"
          fill="rgba(5,10,16,0.42)"
          stroke="rgba(154,185,213,0.08)"
        />

        <text
          x="30"
          y="34"
          fill="#65d6ff"
          fontSize="10"
          fontWeight="800"
          letterSpacing="2"
        >
          EXECUTION BOUNDARY / LIVE SYSTEM MAP
        </text>

        {links.map(([a, b], index) => {
          const from = nodes[a];
          const to = nodes[b];

          return (
            <g key={`${a}-${b}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="url(#lineBlue)"
                strokeWidth="1.2"
                strokeDasharray="5 7"
              />

              <motion.circle
                r="3"
                fill="#67f0e0"
                filter="url(#softGlow)"
                initial={{
                  cx: from.x,
                  cy: from.y,
                  opacity: 0,
                }}
                animate={{
                  cx: [from.x, to.x],
                  cy: [from.y, to.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.4,
                  delay: index * 0.32,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}

        {nodes.map((node, index) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r="32"
              fill={
                node.tone === "cyan"
                  ? "rgba(103,240,224,0.035)"
                  : "rgba(101,214,255,0.035)"
              }
              stroke={
                node.tone === "cyan"
                  ? "rgba(103,240,224,0.35)"
                  : "rgba(101,214,255,0.3)"
              }
            />

            <motion.circle
              cx={node.x}
              cy={node.y}
              r="5"
              fill={node.tone === "cyan" ? "#67f0e0" : "#65d6ff"}
              filter="url(#softGlow)"
              animate={{
                r: [5, 8, 5],
                opacity: [0.72, 1, 0.72],
              }}
              transition={{
                duration: 1.8,
                delay: index * 0.17,
                repeat: Infinity,
              }}
            />

            <text
              x={node.x}
              y={node.y + 52}
              textAnchor="middle"
              fill="#8ea0b4"
              fontSize="10"
              fontWeight="700"
              letterSpacing="1.2"
            >
              {node.label.toUpperCase()}
            </text>
          </g>
        ))}

        <g>
          <rect
            x="28"
            y="376"
            width="624"
            height="26"
            rx="13"
            fill="rgba(8,13,20,0.85)"
            stroke="rgba(154,185,213,0.09)"
          />

          <circle
            cx="44"
            cy="389"
            r="4"
            fill="#57e39d"
          />

          <text
            x="58"
            y="393"
            fill="#8ea0b4"
            fontSize="9"
            letterSpacing="1.5"
          >
            PRE-EXECUTION EVALUATION
          </text>

          <text
            x="540"
            y="393"
            fill="#65d6ff"
            fontSize="9"
            letterSpacing="1.5"
          >
            EVIDENCE ATTACHED
          </text>
        </g>
      </svg>
    </div>
  );
}