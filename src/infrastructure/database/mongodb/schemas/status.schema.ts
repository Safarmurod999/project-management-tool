import { Schema } from 'mongoose';

export const StatusSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    code: { type: String, required: true },
    color: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isDefault: { type: Boolean, required: true, default: false },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);

// A status code is unique inside its project; statuses are shared by all boards of that project.
StatusSchema.index({ projectId: 1, code: 1 }, { unique: true });
