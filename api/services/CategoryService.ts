import { CategoryRepository } from '../repositories/CategoryRepository.js';

export class CategoryService {
  private repo: CategoryRepository;
  constructor() {
    this.repo = new CategoryRepository();
  }
  async list() {
    try {
      return await this.repo.findAll();
    } catch (err: any) {
      const code = err?.code || err?.message;
      if (code === '42P01' || (err?.message || '').includes('relation "categories" does not exist')) {
        return [];
      }
      throw err;
    }
  }
  async create(name: string, parentId: number | null) {
    return this.repo.create(name, parentId);
  }
  async update(id: number, data: Partial<{ name: string; parent_id: number | null; order_index: number }>) {
    return this.repo.update(id, data);
  }
  async remove(id: number) {
    return this.repo.delete(id);
  }
  async reorder(order: Array<{ id: number; order_index: number }>) {
    await this.repo.reorder(order);
  }
}