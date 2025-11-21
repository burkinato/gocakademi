import { query } from '../database/connection.js';

export interface CategoryRow {
  id: number;
  name: string;
  parent_id: number | null;
  order_index: number;
}

export class CategoryRepository {
  async findAll(): Promise<CategoryRow[]> {
    const res = await query('SELECT id, name, parent_id, order_index FROM categories ORDER BY order_index ASC, id ASC');
    return res.rows;
  }

  async create(name: string, parentId: number | null): Promise<CategoryRow> {
    const maxOrder = await query('SELECT COALESCE(MAX(order_index),0) AS max_order FROM categories');
    const orderIndex = (maxOrder.rows[0]?.max_order || 0) + 1;
    const res = await query('INSERT INTO categories (name, parent_id, order_index) VALUES ($1,$2,$3) RETURNING id, name, parent_id, order_index', [name, parentId, orderIndex]);
    return res.rows[0];
  }

  async update(id: number, data: Partial<{ name: string; parent_id: number | null; order_index: number }>): Promise<CategoryRow | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;
    const set = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = fields.map(k => (data as any)[k]);
    const res = await query(`UPDATE categories SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, parent_id, order_index`, [id, ...values]);
    return res.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const res = await query('DELETE FROM categories WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  async reorder(order: Array<{ id: number; order_index: number }>): Promise<void> {
    for (const item of order) {
      await query('UPDATE categories SET order_index = $2 WHERE id = $1', [item.id, item.order_index]);
    }
  }
}