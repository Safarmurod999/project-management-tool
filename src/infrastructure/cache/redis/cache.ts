import Redis from "ioredis";
import { Cache } from "../cache";
import { Inject, Injectable } from "@nestjs/common";
import { RedisConfig } from "src/config";
import { ConfigSymbols } from "src/infrastructure/dependency-injection";

@Injectable()
export class RedisCache implements Cache {
    private readonly _client: Redis;

    constructor(
        @Inject(ConfigSymbols.RedisConfig)
        private readonly config: RedisConfig,
    ) {
        this._client = new Redis({
            port: this.config.getPort(),
            host: this.config.getHost(),
            username: this.config.getUsername(),
            password: this.config.getPassword(),
            db: this.config.getDbIndex(),
            maxRetriesPerRequest: null,
            lazyConnect: true,
        });
    }

    private registerEventHandlers(): void {
        const connection = this._client;

        connection.on("error", (error) => {
            console.error("Redis connection error:", error);
        });

        connection.on("reconnecting", () => {
            console.log("Redis is reconnecting...");
        });
    }

    public get client(): Redis {
        return this._client;
    }

    public async connect(): Promise<void> {
        this.registerEventHandlers();

        await this._client.connect();
        console.log("[Redis] Redis Cache connected.");

    }

    public async disconnect(): Promise<void> {
        this._client.disconnect();
    }
}
