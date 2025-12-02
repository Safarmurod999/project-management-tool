import { Connection, Model } from "mongoose";
import { UserDocument } from "./mongodb/models";

export interface Database {
    getClient(): Connection;
    connect(): void;
    disconnect(): Promise<void>;

    userModel(): Model<UserDocument>;
}
