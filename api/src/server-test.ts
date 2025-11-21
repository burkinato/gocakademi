import app from './app-test.js';
import { env } from './core/config/env.js';

const PORT = env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

export default app;
