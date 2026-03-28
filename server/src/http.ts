import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { apiRoutes } from "./routes/api.js";

const PORT = parseInt(process.env.PORT ?? "3002", 10);

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  // API routes
  await app.register(apiRoutes);

  // Serve dashboard static build if it exists
  const dashboardDist = resolve(import.meta.dirname, "../../dashboard/dist");
  if (existsSync(dashboardDist)) {
    await app.register(fastifyStatic, {
      root: dashboardDist,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback: serve index.html for non-API routes
    app.setNotFoundHandler(async (req, reply) => {
      if (req.url.startsWith("/api/")) {
        return reply.status(404).send({ error: "Not found" });
      }
      return reply.sendFile("index.html");
    });
  }

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Nexus HTTP server running on http://0.0.0.0:${PORT}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
