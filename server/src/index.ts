import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`TrustLoop API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
