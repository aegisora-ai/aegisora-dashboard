import http from "node:http";
import { pathToFileURL } from "node:url";

const PORT = Number(process.env.AEGISORA_PROOF_PORT ?? "8787");
const CORE_ROOT =
  process.env.AEGISORA_CORE_ROOT ??
  "C:\\AI\\AEGISORA\\core";

async function main() {
  const runtimeSrc =
    `${CORE_ROOT}\\packages\\runtime\\src`;

  const runtimeContextModule = await import(
    pathToFileURL(
      `${runtimeSrc}\\context\\runtime-context.ts`,
    ).href,
  );

  const enforcementModule = await import(
    pathToFileURL(
      `${runtimeSrc}\\enforcement\\enforcement-gate.ts`,
    ).href,
  );

  const RuntimeContext =
    runtimeContextModule.RuntimeContext;

  const EnforcementGate =
    enforcementModule.EnforcementGate;

  const context =
    new RuntimeContext();

  const gate =
    new EnforcementGate(context);

  const DEMO_AGENT_ID =
    "website-proof-agent";

  function ensureAgent() {
    if (
      !context.agentRegistry.getById(
        DEMO_AGENT_ID,
      )
    ) {
      context.agentRegistry.register({
        id: DEMO_AGENT_ID,
        name: "Website Proof Agent",
      });
    }
  }

  function json(
    res: http.ServerResponse,
    status: number,
    payload: unknown,
  ) {
    res.statusCode = status;
    res.setHeader(
      "content-type",
      "application/json; charset=utf-8",
    );
    res.setHeader(
      "access-control-allow-origin",
      "*",
    );
    res.setHeader(
      "access-control-allow-methods",
      "GET,POST,OPTIONS",
    );
    res.setHeader(
      "access-control-allow-headers",
      "content-type",
    );
    res.end(JSON.stringify(payload));
  }

  function readBody(
    req: http.IncomingMessage,
  ): Promise<string> {
    return new Promise(
      (resolve, reject) => {
        let body = "";

        req.on(
          "data",
          (chunk) => {
            body += chunk;

            if (
              body.length >
              100_000
            ) {
              reject(
                new Error(
                  "Request body too large.",
                ),
              );
              req.destroy();
            }
          },
        );

        req.on(
          "end",
          () => resolve(body),
        );

        req.on(
          "error",
          reject,
        );
      },
    );
  }

  const server =
    http.createServer(
      async (req, res) => {
        if (
          req.method ===
          "OPTIONS"
        ) {
          json(res, 204, {});
          return;
        }

        if (
          req.method === "GET" &&
          req.url === "/health"
        ) {
          json(res, 200, {
            status: "ok",
            service:
              "aegisora-3.0-website-proof",
            live: true,
          });
          return;
        }

        if (
          req.method !== "POST" ||
          req.url !== "/enforce"
        ) {
          json(res, 404, {
            error: "Not found.",
          });
          return;
        }

        try {
          const raw =
            await readBody(req);

          const body =
            JSON.parse(
              raw || "{}",
            );

          const agentId =
            typeof body.agentId ===
              "string" &&
            body.agentId.trim()
              ? body.agentId.trim()
              : DEMO_AGENT_ID;

          ensureAgent();

          if (
            agentId !==
            DEMO_AGENT_ID
          ) {
            if (
              !context.agentRegistry.getById(
                agentId,
              )
            ) {
              context.agentRegistry.register({
                id: agentId,
                name: agentId,
              });
            }
          }

          const tool =
            typeof body.tool ===
              "string"
              ? body.tool.trim()
              : "";

          const action =
            typeof body.action ===
              "string"
              ? body.action.trim()
              : "";

          if (!tool || !action) {
            json(res, 400, {
              live: true,
              error:
                "tool and action are required.",
            });
            return;
          }

          const started =
            Date.now();

          const result =
            await gate.enforce({
              agentId,
              resourceType:
                "tool",
              tool,
              action,
              input:
                body.input ?? {},
              metadata: {
                source:
                  "website4-live-proof",
                requiresReview:
                  body.requiresReview ===
                  true,
              },
            });

          json(res, 200, {
            ...result,
            live: true,
            latencyMs:
              Date.now() - started,
            runtime:
              "Aegisora 3.0",
          });
        } catch (error) {
          json(res, 500, {
            live: false,
            error:
              error instanceof Error
                ? error.message
                : String(error),
          });
        }
      },
    );

  server.listen(
    PORT,
    "127.0.0.1",
    () => {
      console.log(
        `Aegisora 3.0 proof runtime listening on http://127.0.0.1:${PORT}`,
      );
      console.log(
        `Core root: ${CORE_ROOT}`,
      );
    },
  );
}

main().catch((error) => {
  console.error(
    "Aegisora 3.0 proof runtime failed to start.",
  );
  console.error(error);
  process.exitCode = 1;
});
