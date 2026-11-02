import { Injectable } from '@nestjs/common';
import { StatusException } from './exception';

export interface StatusStruct {
  id: string;
  projectId: string;
  name: string;
  code: string;
  color: string;
  order: number;
  isDefault: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export type StatusFactoryParams = Omit<
  StatusStruct,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'version'
  | 'code'
  | 'color'
  | 'order'
  | 'isDefault'
> & {
  code?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
};

export const STATUS_CODE_PATTERN = /^[a-z0-9_]+$/;
export const STATUS_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
export const DEFAULT_STATUS_COLOR = '#9E9E9E';

export type StatusValidationParams = Partial<
  Pick<StatusStruct, 'name' | 'code' | 'color' | 'order'>
>;

export interface StatusFactory {
  create(data: StatusFactoryParams): StatusStruct;
  /** Validates only the fields that are present; used for partial updates. */
  validate(data: StatusValidationParams): void;
}

@Injectable()
export class StatusFactoryImpl implements StatusFactory {
  create(data: StatusFactoryParams): StatusStruct {
    if (!data.name || data.name.trim().length === 0) {
      throw StatusException.InvalidName();
    }

    const code = data.code ?? StatusFactoryImpl.toCode(data.name);
    const color = data.color ?? DEFAULT_STATUS_COLOR;
    const order = data.order ?? 0;

    this.validate({ code, color, order });

    return {
      projectId: data.projectId,
      name: data.name.trim(),
      code,
      color,
      order,
      isDefault: data.isDefault ?? false,
      id: '',
      version: 1,
      createdAt: new Date(),
      updatedAt: null,
    };
  }

  validate(data: StatusValidationParams): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw StatusException.InvalidName();
    }

    if (data.code !== undefined && !STATUS_CODE_PATTERN.test(data.code)) {
      throw StatusException.InvalidCode();
    }

    if (data.color !== undefined && !STATUS_COLOR_PATTERN.test(data.color)) {
      throw StatusException.InvalidColor();
    }

    if (data.order !== undefined && data.order < 0) {
      throw StatusException.InvalidOrder();
    }
  }

  /** Derives a stable status code from a display name, e.g. "In Progress" -> "in_progress". */
  static toCode(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
