/* eslint-disable @typescript-eslint/no-unsafe-return */
type DelegateWithDefaultArgs = {
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  updateMany: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

// Ce type permet d'extraire les bons paramètres et retours typés :
type MethodArgs<T, K extends keyof T> = T[K] extends (args: infer A) => any
  ? A
  : never;
type MethodReturn<T, K extends keyof T> = T[K] extends (
  ...args: any[]
) => infer R
  ? R
  : never;

export abstract class PrismaRepository<
  TDelegate extends DelegateWithDefaultArgs,
> {
  constructor(protected readonly delegate: TDelegate) {}

  async findUnique(
    args: MethodArgs<TDelegate, 'findUnique'>,
  ): Promise<MethodReturn<TDelegate, 'findUnique'>> {
    return await this.delegate.findUnique(args);
  }

  async findFirst(
    args: MethodArgs<TDelegate, 'findFirst'>,
  ): Promise<MethodReturn<TDelegate, 'findFirst'>> {
    return await this.delegate.findFirst(args);
  }

  async findMany(
    args?: MethodArgs<TDelegate, 'findMany'>,
  ): Promise<MethodReturn<TDelegate, 'findMany'>> {
    return await this.delegate.findMany(args);
  }

  async create(
    args: MethodArgs<TDelegate, 'create'>,
  ): Promise<MethodReturn<TDelegate, 'create'>> {
    return await this.delegate.create(args);
  }

  async createMany(
    args: MethodArgs<TDelegate, 'createMany'>,
  ): Promise<MethodReturn<TDelegate, 'createMany'>> {
    return await this.delegate.createMany(args);
  }

  async update(
    args: MethodArgs<TDelegate, 'update'>,
  ): Promise<MethodReturn<TDelegate, 'update'>> {
    return await this.delegate.update(args);
  }

  async updateMany(
    args: MethodArgs<TDelegate, 'updateMany'>,
  ): Promise<MethodReturn<TDelegate, 'updateMany'>> {
    return await this.delegate.updateMany(args);
  }

  async delete(
    args: MethodArgs<TDelegate, 'delete'>,
  ): Promise<MethodReturn<TDelegate, 'delete'>> {
    return await this.delegate.delete(args);
  }
}
