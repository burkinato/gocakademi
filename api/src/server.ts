import net from 'node:net';
import app from './app.js';
import { env } from './core/config/env.js';

const DEFAULT_PORT = env.PORT === 3000 ? 3001 : env.PORT;

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();
    tester.once('error', (error: NodeJS.ErrnoException) => {
      tester.close();
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        resolve(false);
        return;
      }
      reject(error);
    });
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port);
  });
}

async function findAvailablePort(startingPort: number): Promise<number> {
  let port = startingPort;
  while (!(await isPortAvailable(port))) {
    port += 1;
  }
  return port;
}

async function startServer(): Promise<void> {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    if (port !== DEFAULT_PORT) {
      console.warn(`⚠️  Port ${DEFAULT_PORT} is busy. Falling back to ${port}.`);
    }

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 Educational Platform API started`);
      console.log(`🔧 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
