import { Entity } from './entity';

export interface Repository<TEntity extends Entity> {
    createOne(data: TEntity): Promise<TEntity>;
    findAll(filter?: Partial<TEntity>): Promise<TEntity[]>;
    findOne(filter: Partial<TEntity>): Promise<TEntity | null>;
    updateOne(id: string, data: Partial<TEntity>): Promise<TEntity>;
    removeOne(id: string): Promise<void>;
}
