import { Schema } from "mongoose";
import { UserDocument } from "../models";

export const UserSchema = new Schema<UserDocument>(
  {
    _name: { type: String, required: true },
    _email: { type: String, required: true, unique: true },
    _password: { type: String, required: true },
    _createdAt: { type: Date, required: true },
    _updatedAt: { type: Date, required: false, default: null },
  },
  {
    versionKey: false,
  }
);
