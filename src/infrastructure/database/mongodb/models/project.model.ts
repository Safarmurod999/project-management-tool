import { Document, Types } from 'mongoose';
import { ProjectStatus } from 'src/infrastructure/common/enum';

export interface ProjectDocument extends Document {
  name: string;
  description: string | null;
  teamId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date | null;
  status: ProjectStatus;
}
