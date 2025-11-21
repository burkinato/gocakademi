import app from './app-minimal.js';
import { env } from './core/config/env.js';

const PORT = env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
