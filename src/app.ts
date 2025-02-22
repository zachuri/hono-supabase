import { OpenAPIHono } from '@hono/zod-openapi';
import { sentry } from "@hono/sentry";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { env, type AppContext } from "./config/env";
import errorHandler from "./middlewares/error.middleware";
import swaggerApp from "./middlewares/swagger.middleware";
import authRoutes from "./routes/auth.routes";
import iamRoutes from "./routes/iam.routes";

const app = new OpenAPIHono<AppContext>()
	.basePath("/api")
	.doc("/doc", {
		info: {
			title: "An API",
			version: "v1",
		},
		openapi: "3.1.0",
	})
	// Middlewares
	.use("*", logger())
	.use("*", cors())
	.use("*", csrf())
	.use("*", prettyJSON())
	.use("*", secureHeaders())
	.use("*", timing())
	.use("*", sentry({ dsn: env.SENTRY_DSN, tracesSampleRate: 0.2 }))
	// Routes
	.route("/ui", swaggerApp)
	.route("/auth", authRoutes)
	.route("/iam", iamRoutes)
	.onError(errorHandler);

// Export the app TYPE
export type AppType = typeof app;

export default app;
