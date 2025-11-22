import path from 'path';
import fs from 'fs';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const AVATAR_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'avatars');

function ensureDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

ensureDirectory(UPLOADS_ROOT);
ensureDirectory(AVATAR_UPLOAD_DIR);

export { UPLOADS_ROOT, AVATAR_UPLOAD_DIR };
