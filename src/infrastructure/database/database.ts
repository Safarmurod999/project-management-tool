import { Connection, Model } from "mongoose";
import { PermissionDocument, RoleDocument, UserDocument } from "./mongodb/models";

export interface Database {
    getClient(): Connection;
    connect(): void;
    disconnect(): Promise<void>;

    userModel(): Model<UserDocument>;
    permissionModel(): Model<PermissionDocument>;
    roleModel(): Model<RoleDocument>;
}
