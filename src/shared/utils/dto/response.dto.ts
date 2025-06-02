import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { mixin } from '@nestjs/common';
import { Type } from 'class-transformer';

@ApiExtraModels()
export class ResponseDto<T> {
  constructor(data?: T) {
    this.status = 'OK';
    this.data = data;
  }

  @ApiProperty({ example: 'OK', description: 'Status of the response' })
  status: string;

  @ApiProperty({
    description: 'The data payload of the response',
  })
  data: T;
}

type Constructor<T = object> = new (...args: any[]) => T;

export function withBaseResponse<TBase extends Constructor>(
  Base: TBase,
  options?: ApiPropertyOptions,
) {
  class ResponseDTO {
    constructor(data?: InstanceType<TBase>) {
      this.status = 'OK';
      this.data = data;
    }
    @ApiProperty({ example: 'OK', description: 'Status of the response' })
    status: string;
    @ApiProperty({
      type: Base,
      ...options,
    })
    @Type(() => Base)
    data!: InstanceType<TBase>;
  }
  return mixin(ResponseDTO); // This is important otherwise you will get always the same instance
}
export function withBaseArrayResponse<TBase extends Constructor>(
  Base: TBase,
  options?: ApiPropertyOptions,
) {
  class ResponseDTO {
    constructor(data?: InstanceType<TBase>[]) {
      this.status = 'OK';
      this.data = data;
    }
    @ApiProperty({ example: 'OK', description: 'Status of the response' })
    status: string;
    @ApiProperty({
      type: Base,
      isArray: true,
      ...options,
    })
    @Type(() => Base)
    data!: InstanceType<TBase>[];
  }
  return mixin(ResponseDTO); // This is important otherwise you will get always the same instance
}
