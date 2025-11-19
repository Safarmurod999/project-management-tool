import { Connection, createConnection, Model } from 'mongoose';
import { UserSchema } from './schemas';
import { UserDocument } from './models';
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

  public async connect(): Promise<void> {
    if (this._client) return;

    const uri = `mongodb+srv://${this.config.getUsername()}:${this.config.getPassword()}@${this.config.getHost()}?authSource=admin`;

    this._client = createConnection(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

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
    return this._client.model<UserDocument>('User', UserSchema);
  }
}
