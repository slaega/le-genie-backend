import { Entity } from '#core/entity';
import { Repository } from '#core/repository';
import { randomUUID } from 'node:crypto';

export class RepositoryCacheMemory<TEntity extends Entity>
  implements Repository<TEntity>
{
  protected readonly items: TEntity[];

  constructor() {
    this.items = [];
  }

  createOne(data: TEntity): Promise<TEntity> {
    data.id = randomUUID();
    const count = this.items.push(data);
    return Promise.resolve(this.items[count - 1]);
  }

  async findAll(filter?: Partial<TEntity>): Promise<TEntity[]> {
    let filtered = this.items;
    for (const key in filter) {
      filtered = filtered.filter((item) => item[key] === filter[key]);
    }
    return Promise.resolve(filtered);
  }

  async findOne(filter: Partial<TEntity>): Promise<TEntity | null> {
    return await this.findAll(filter).then((items) =>
      items.length > 0 ? items[0] : null,
    );
  }

  async updateOne(id: string, data: Partial<TEntity>): Promise<TEntity> {
    const index = this.getIndexById(id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    for (const key in data) {
      this.items[index][key] = data[key];
    }
    return Promise.resolve(this.items[index]);
  }

  async removeOne(id: string): Promise<void> {
    const index = this.getIndexById(id);
    if (index === -1) {
      // TODO: handle the case of not finding the item to be deleted
    }
    this.items.splice(index, 1);
    return Promise.resolve();
  }

  private getIndexById(id: string) {
    return this.items.findIndex((item) => item.id === id);
  }
}
