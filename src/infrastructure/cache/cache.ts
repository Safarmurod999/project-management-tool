import Redis from "ioredis";

export interface Cache {
    client: Redis;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
