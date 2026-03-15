import { Connection, createConnection, Model } from 'mongoose';
import {
  UserSchema,
  PermissionSchema,
  RoleSchema,
  RolePermissionSchema,
  TeamSchema,
  ProjectSchema,
  MembershipSchema,
  BoardSchema,
} from './schemas';
import {
  UserDocument,
  PermissionDocument,
  RoleDocument,
  RolePermissionDocument,
  TeamDocument,
  ProjectDocument,
  MembershipDocument,
  BoardDocument,
} from './models';
import { Database } from '../database';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigSymbols } from 'src/infrastructure/dependency-injection';
import { MongoDbConfig } from 'src/config';

@Injectable()
export class MongoDb implements Database {
  private _client: Connection | null = null;

  constructor(
    @Inject(ConfigSymbols.MongoDbConfig)
    private readonly config: MongoDbConfig,
  ) {}

  private getConnectionString(): string {
    const isProduction = this.config.getMode() == 'production';

    if (isProduction) {
      // MongoDB Cloud connection string
      return `mongodb+srv://${this.config.getUsername()}:${this.config.getPassword()}@${this.config.getHost()}/${this.config.getDbName()}?authSource=admin`;
    } else {
      // Localhost
      return `mongodb://${this.config.getHost()}:${this.config.getPort()}/${this.config.getDbName()}`;
    }
  }

  public connect(): void {
    if (this._client) return;

    const uri = this.getConnectionString();

    this._client = createConnection(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    this._client.model<UserDocument>('User', UserSchema);
    this._client.model<PermissionDocument>('Permission', PermissionSchema);
    this._client.model<RoleDocument>('Role', RoleSchema);
    this._client.model<RolePermissionDocument>(
      'RolePermission',
      RolePermissionSchema,
    );
    this._client.model<TeamDocument>('Team', TeamSchema);
    this._client.model<ProjectDocument>('Project', ProjectSchema);
    this._client.model<MembershipDocument>('Membership', MembershipSchema);
    this._client.model<BoardDocument>('Board', BoardSchema);

    console.log('[MongoDB] Connected.');
  }

  public async disconnect(): Promise<void> {
    if (!this._client) return;
    await this._client.close();
    this._client = null;
    console.log('[MongoDB] Disconnected.');
  }

  public getClient(): Connection {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client;
  }

  public userModel(): Model<UserDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<UserDocument>('User');
  }

  public permissionModel(): Model<PermissionDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<PermissionDocument>('Permission');
  }

  public roleModel(): Model<RoleDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<RoleDocument>('Role');
  }
  rolePermissionModel(): Model<RolePermissionDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<RolePermissionDocument>('RolePermission');
  }

  public teamModel(): Model<TeamDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<TeamDocument>('Team');
  }

  public projectModel(): Model<ProjectDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<ProjectDocument>('Project');
  }

  public membershipModel(): Model<MembershipDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<MembershipDocument>('Membership');
  }

  public boardModel(): Model<BoardDocument> {
    if (!this._client) throw new Error('MongoDB not connected');
    return this._client.model<BoardDocument>('Board');
  }
}
