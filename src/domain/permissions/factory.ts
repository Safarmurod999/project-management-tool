import { Permission } from "./entity";

export interface PermissionStruct {
    id: string;
    name: string;
    description: string;
    isActive?: boolean;
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
            data.name,
            data.description,
            data.createdAt,
            data.updatedAt,
            data.isActive,
        );
    }
}
