import { PermissionCode, PermissionStatus } from "src/infrastructure/common/enum";
import { Permission } from "./entity";

export interface PermissionStruct {
    id: string;
    code: PermissionCode;
    status?: PermissionStatus;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface PermissionFactory {
    create(data: PermissionStruct): Permission;
}

export class PermissionFactoryImpl implements PermissionFactory {
    create(data: PermissionStruct): Permission {
        return new Permission(
            data.id,
            data.code,
            data.createdAt,
            data.updatedAt,
            data.status as PermissionStatus || PermissionStatus.ACTIVE,
        );
    }
}
