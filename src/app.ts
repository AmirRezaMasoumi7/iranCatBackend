import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.isDevelopment ? true : env.corsOrigins,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === `${env.API_PREFIX}/health`,
    },
  }),
);

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests", code: "RATE_LIMIT_EXCEEDED" },
  },
});

app.use(env.API_PREFIX, limiter);
app.use(env.API_PREFIX, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
