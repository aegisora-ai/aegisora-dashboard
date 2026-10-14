import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT =
  "C:\\AI\\AEGISORA\\website4";

const PORT = 3399;

const BASE_URL =
  `http://127.0.0.1:${PORT}`;

const NEXT_CLI =
  path.join(
    ROOT,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

let failures = 0;
let server = null;

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );

function pass(name, message) {
  console.log(
    `[PASS] ${name} -> ${message}`,
  );
}

function fail(name, message) {
  failures += 1;

  console.error(
    `[FAIL] ${name} -> ${message}`,
  );
}

async function httpRequest(
  pathname,
  options = {},
) {
  const response =
    await fetch(
      `${BASE_URL}${pathname}`,
      {
        redirect: "manual",
        ...options,
      },
    );

  return {
    status: response.status,
    body: await response.text(),
  };
}

async function waitForReady() {
  const deadline =
    Date.now() + 45000;

  while (
    Date.now() < deadline
  ) {
    if (
      server &&
      server.exitCode !== null
    ) {
      return false;
    }

    try {
      const response =
        await fetch(
          `${BASE_URL}/`,
          {
            redirect: "manual",
          },
        );

      if (
        response.status >= 200 &&
        response.status < 500
      ) {
        return true;
      }
    } catch {
      // Server is still starting.
    }

    await sleep(500);
  }

  return false;
}

function startServer() {
  return spawn(
    process.execPath,
    [
      NEXT_CLI,
      "start",
      "-p",
      String(PORT),
    ],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        PORT: String(PORT),
      },
      stdio: [
        "ignore",
        "pipe",
        "pipe",
      ],
      windowsHide: true,
    },
  );
}

async function stopServer(child) {
  if (
    !child ||
    child.pid === undefined ||
    child.pid === null
  ) {
    return;
  }

  try {
    if (
      process.platform ===
      "win32"
    ) {
      const killer =
        spawn(
          "taskkill.exe",
          [
            "/PID",
            String(child.pid),
            "/T",
            "/F",
          ],
          {
            stdio: "ignore",
            windowsHide: true,
          },
        );

      await new Promise(
        (resolve) => {
          killer.on(
            "close",
            resolve,
          );

          killer.on(
            "error",
            resolve,
          );
        },
      );
    }
    else {
      child.kill(
        "SIGTERM",
      );

      await sleep(500);
    }
  } catch {
    // Best-effort cleanup only.
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " AEGISORA LOCAL PRODUCTION REVENUE API SMOKE",
);
console.log(
  "============================================================",
);
console.log("");
console.log(
  `ROOT=${ROOT}`,
);
console.log(
  `BASE_URL=${BASE_URL}`,
);
console.log(
  `NEXT_CLI=${NEXT_CLI}`,
);
console.log("");

try {
  if (
    !existsSync(
      path.join(
        ROOT,
        ".next",
      ),
    )
  ) {
    fail(
      "Production build",
      ".next does not exist",
    );
  }
  else {
    pass(
      "Production build",
      ".next exists",
    );
  }

  if (
    !existsSync(
      NEXT_CLI,
    )
  ) {
    fail(
      "Next CLI",
      "Next CLI does not exist",
    );
  }
  else {
    pass(
      "Next CLI",
      "Next CLI exists",
    );
  }

  if (
    failures === 0
  ) {
    console.log(
      "[INFO] Starting Next.js production server...",
    );

    server =
      startServer();

    server.stdout.on(
      "data",
      (chunk) => {
        process.stdout.write(
          String(chunk),
        );
      },
    );

    server.stderr.on(
      "data",
      (chunk) => {
        process.stderr.write(
          String(chunk),
        );
      },
    );

    server.on(
      "error",
      (error) => {
        if (
          server &&
          server.exitCode !==
            null
        ) {
          return;
        }

        fail(
          "Production process",
          error instanceof Error
            ? error.message
            : String(error),
        );
      },
    );

    const ready =
      await waitForReady();

    if (!ready) {

      let detail =
        "Server did not become ready within 45 seconds.";

      if (
        server &&
        server.exitCode !==
          null
      ) {
        detail +=
          ` Process exited with code ${server.exitCode}.`;
      }

      fail(
        "Production server",
        detail,
      );

    }
    else {

      pass(
        "Production server",
        "HTTP server responding",
      );

      const root =
        await httpRequest(
          "/",
        );

      if (
        root.status >= 200 &&
        root.status < 400
      ) {
        pass(
          "Root route",
          `HTTP ${root.status}`,
        );
      }
      else {
        fail(
          "Root route",
          `HTTP ${root.status}`,
        );
      }

      const billing =
        await httpRequest(
          "/api/billing/status",
        );

      if (
        billing.status === 401
      ) {
        pass(
          "Billing status authentication",
          "HTTP 401",
        );
      }
      else {
        fail(
          "Billing status authentication",
          `HTTP ${billing.status}; expected 401`,
        );
      }

      const checkout =
        await httpRequest(
          "/api/stripe/checkout",
          {
            method: "POST",
            headers: {
              "content-type":
                "application/json",
            },
            body: JSON.stringify({
              plan: "team",
            }),
          },
        );

      if (
        checkout.status === 401
      ) {
        pass(
          "Checkout authentication",
          "HTTP 401",
        );
      }
      else {
        fail(
          "Checkout authentication",
          `HTTP ${checkout.status}; expected 401`,
        );
      }

      const portal =
        await httpRequest(
          "/api/stripe/portal",
          {
            method: "POST",
            headers: {
              "content-type":
                "application/json",
            },
            body: "{}",
          },
        );

      if (
        portal.status === 401
      ) {
        pass(
          "Billing portal authentication",
          "HTTP 401",
        );
      }
      else {
        fail(
          "Billing portal authentication",
          `HTTP ${portal.status}; expected 401`,
        );
      }

      const webhook =
        await httpRequest(
          "/api/stripe/webhook",
          {
            method: "POST",
            headers: {
              "content-type":
                "application/json",
            },
            body: JSON.stringify({
              type:
                "test.event",
            }),
          },
        );

      if (
        webhook.status === 400 ||
        webhook.status === 503
      ) {
        pass(
          "Unsigned webhook rejection",
          `HTTP ${webhook.status}`,
        );
      }
      else {
        fail(
          "Unsigned webhook rejection",
          `HTTP ${webhook.status}; expected 400 or 503`,
        );
      }
    }
  }
}
catch (error) {

  fail(
    "Revenue smoke",
    error instanceof Error
      ? error.message
      : String(error),
  );

}
finally {

  await stopServer(
    server,
  );

}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " REVENUE API SMOKE RESULT",
);
console.log(
  "============================================================",
);
console.log("");

if (
  failures === 0
) {
  console.log(
    "RESULT: LOCAL PRODUCTION REVENUE API = GREEN",
  );

  process.exitCode =
    0;
}
else {
  console.error(
    `RESULT: LOCAL PRODUCTION REVENUE API = RED (${failures} failure(s))`,
  );

  process.exitCode =
    1;
}