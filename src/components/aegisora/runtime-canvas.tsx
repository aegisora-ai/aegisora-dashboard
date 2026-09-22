export function RuntimeCanvas() {

  const nodes = [
    "Request",
    "Context",
    "Policy",
    "Risk",
    "Decision",
    "Execution",
    "Evidence",
  ]

  return (
    <div className="ae-runtime-canvas">

      <div className="ae-runtime-orbit ae-runtime-orbit-1" />
      <div className="ae-runtime-orbit ae-runtime-orbit-2" />

      <div className="ae-runtime-core">

        <span>
          AEGISORA
        </span>

        <strong>
          EXECUTION
          <br />
          BOUNDARY
        </strong>

      </div>

      {nodes.map(
        (node, index) => (
          <div
            key={node}
            className={
              "ae-runtime-node " +
              "ae-runtime-node-" +
              String(index + 1)
            }
          >
            <span className="ae-runtime-node-index">
              {String(index + 1).padStart(2, "0")}
            </span>

            <strong>
              {node}
            </strong>

          </div>
        ),
      )}

    </div>
  )
}