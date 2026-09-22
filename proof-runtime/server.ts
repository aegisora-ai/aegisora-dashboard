import http from "node:http";
import { pathToFileURL } from "node:url";

const PORT =
  Number(
    process.env.AEGISORA_PROOF_PORT ?? "8787",
  );

const CORE_ROOT =
  process.env.AEGISORA_CORE_ROOT ??
  "C:\\AI\\AEGISORA\\core";

async function main() {
  const runtimeSrc =
    `${CORE_ROOT}\\packages\\runtime\\src`;

  const contextModule =
    await import(
      pathToFileURL(
        `${runtimeSrc}\\context\\runtime-context.ts`,
      ).href,
    );

  const enforcementModule =
    await import(
      pathToFileURL(
        `${runtimeSrc}\\enforcement\\enforcement-gate.ts`,
      ).href,
    );

  const RuntimeContext =
    contextModule.RuntimeContext;

  const EnforcementGate =
    enforcementModule.EnforcementGate;

  const context =
    new RuntimeContext();

  const gate =
    new EnforcementGate(
      context,
    );

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
    response: http.ServerResponse,
    status: number,
    payload: unknown,
  ) {
    response.statusCode = status;

    response.setHeader(
      "content-type",
      "application/json; charset=utf-8",
    );

    response.setHeader(
      "access-control-allow-origin",
      "*",
    );

    response.setHeader(
      "access-control-allow-methods",
      "GET,POST,OPTIONS",
    );

    response.setHeader(
      "access-control-allow-headers",
      "content-type",
    );

    response.end(
      JSON.stringify(payload),
    );
  }

  function readBody(
    request: http.IncomingMessage,
  ): Promise<string> {
    return new Promise(
      (resolve, reject) => {
        let body = "";

        request.on(
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

              request.destroy();
            }
          },
        );

        request.on(
          "end",
          () => resolve(body),
        );

        request.on(
          "error",
          reject,
        );
      },
    );
  }

  const server =
    http.createServer(
      async (
        request,
        response,
      ) => {
        if (
          request.method ===
          "OPTIONS"
        ) {
          json(
            response,
            204,
            {},
          );
          return;
        }

        if (
          request.method === "GET" &&
          request.url === "/health"
        ) {
          json(
            response,
            200,
            {
              status: "ok",
              service:
                "aegisora-3.0-website-proof",
              live: true,
            },
          );
          return;
        }

        if (
          request.method !== "POST" ||
          request.url !== "/enforce"
        ) {
          json(
            response,
            404,
            {
              error: "Not found.",
            },
          );
          return;
        }

        try {
          const raw =
            await readBody(
              request,
            );

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

          if (
            !tool ||
            !action
          ) {
            json(
              response,
              400,
              {
                live: true,
                error:
                  "tool and action are required.",
              },
            );
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
                  body.requiresReview === true,
              },
            });

          json(
            response,
            200,
            {
              ...result,
              live: true,
              latencyMs:
                Date.now() -
                started,
              runtime:
                "Aegisora 3.0",
            },
          );
        }
        catch (error) {
          json(
            response,
            500,
            {
              live: false,
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            },
          );
        }
      },
    );

  server.listen(
    PORT,
    "127.0.0.1",
    () => {
      console.log(
        "============================================================",
      );

      console.log(
        "AEGISORA 3.0 REAL PROOF RUNTIME ONLINE",
      );

      console.log(
        `http://127.0.0.1:${PORT}`,
      );

      console.log(
        `Core: ${CORE_ROOT}`,
      );

      console.log(
        "============================================================",
      );
    },
  );
}

main().catch(
  (error) => {
    console.error(
      "AEGISORA 3.0 PROOF RUNTIME FAILED",
    );

    console.error(
      error,
    );

    process.exitCode = 1;
  },
);