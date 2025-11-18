import { Inject, Injectable } from "@nestjs/common";
import mongoose, { Connection } from "mongoose";
import { Database } from "../database";
import { MongoDbConfig } from "src/config";
import { ConfigSymbols } from "src/infrastructure/dependency-injection";

@Injectable()
export class MongoDb implements Database {
    private _client: Connection | null = null;
    private isConnected = false;

    constructor(
        @Inject(ConfigSymbols.MongoDbConfig)
        private readonly config: MongoDbConfig
    ) {}

    public async connect(): Promise<void> {
        if (this.isConnected) {
            return;
        }
        
        const uri = `mongodb+srv://${this.config.getUsername()}:${this.config.getPassword()}@${this.config.getHost()}?authSource=admin`;

        try {
            await mongoose.connect(uri, {
                maxPoolSize: 10,
                minPoolSize: 2,
                connectTimeoutMS: 5000,
                serverSelectionTimeoutMS: 5000
            });

            this._client = mongoose.connection;
            this.isConnected = true;

            // Events
            this._client.on("connected", () => {
                console.log("[MongoDB] Connected.");
            });

            this._client.on("disconnected", () => {
                this.isConnected = false;
                console.log("[MongoDB] Disconnected.");
            });

            this._client.on("error", (err) => {
                console.error("[MongoDB] Error:", err);
            });

        } catch (error) {
            console.error("[MongoDB] Initial connection failed:", error);

            // retry strategy
            setTimeout(() => {
                console.log("[MongoDB] Retrying connection...");
                this.connect();
            }, 3000);
        }
    }

    public async disconnect(): Promise<void> {
        if (!this._client) return;

        await this._client.close();
        this.isConnected = false;
    }

    public getClient(): Connection {
        if (!this._client) {
            throw new Error("MongoDB client is not initialized. Call connect() first.");
        }
        return this._client;
    }
}
