import app from './app.js';
import { env } from './core/config/env.js';

const PORT = env.PORT === 3000 ? 3001 : env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Educational Platform API started`);
  console.log(`🔧 Environment: ${env.NODE_ENV}`);
});

export default app;
