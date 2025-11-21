import { Router } from 'express';
import { CategoryService } from '../../application/services/CategoryService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const publicRouter = Router();
const adminRouter = Router();
const service = new CategoryService();

publicRouter.get('/', async (req, res) => {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Kategoriler yüklenemedi' });
  }
});

adminRouter.use(authMiddleware);

adminRouter.post('/', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const data = await service.create(String(name), parentId ? Number(parentId) : null);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Kategori oluşturulamadı' });
  }
});

adminRouter.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await service.update(id, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Kategori güncellenemedi' });
  }
});

adminRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ok = await service.remove(id);
    res.json({ success: ok });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Kategori silinemedi' });
  }
});

adminRouter.patch('/reorder', async (req, res) => {
  try {
    const order = Array.isArray(req.body?.order) ? req.body.order.map((x: any) => ({ id: Number(x.id), order_index: Number(x.order_index) })) : [];
    await service.reorder(order);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Kategoriler yeniden sıralanamadı' });
  }
});

export const categoriesPublicRouter = publicRouter;
export const categoriesAdminRouter = adminRouter;