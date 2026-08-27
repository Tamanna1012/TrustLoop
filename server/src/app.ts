import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env.js';
import healthRoute from './routes/health.route.js';
import authRoute from './routes/auth.route.js';
import circleRoute from './routes/circle.route.js';
import notificationRoute from './routes/notification.route.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// Defense-in-depth against NoSQL operator injection (e.g. a `$gt`/`$ne` key
// sneaked into a body/query/param) — Zod validation is the primary guard,
// this catches anything a schema didn't anticipate.
app.use(mongoSanitize());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Blanket limiter for the whole API; auth routes get a stricter one in Phase 3.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/circles', circleRoute);
app.use('/api/notifications', notificationRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
