import { mongo, Schema } from 'mongoose';

/** Workflow names are compared case-insensitively ("Default" = "default"). */
export const WORKFLOW_NAME_COLLATION: mongo.CollationOptions = {
  locale: 'en',
  strength: 2,
};

export const WorkflowSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: null },
    isDefault: { type: Boolean, required: true, default: false },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);

WorkflowSchema.index(
  { projectId: 1, name: 1 },
  { unique: true, collation: WORKFLOW_NAME_COLLATION },
);

// At most one default workflow per project.
WorkflowSchema.index(
  { projectId: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
    name: 'projectId_default_unique',
  },
);
