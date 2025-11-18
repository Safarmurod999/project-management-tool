import { Document } from "mongoose";

export interface UserDocument extends Document {
  readonly _name: string;
  readonly _email: string;
  readonly _password: string;
  readonly _createdAt: Date;
  readonly _updatedAt: Date | null;
}
