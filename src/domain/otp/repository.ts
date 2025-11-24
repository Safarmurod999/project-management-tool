import { Otp } from "./entity";
import { OtpException } from "./exception";
import { OtpFactory, OtpStruct } from "./factory";
import { Cache } from "../../infrastructure/cache/cache";
import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { CacheSymbols, ConfigSymbols, FactorySymbols } from "src/infrastructure/dependency-injection";
import { OtpConfig } from "src/config";

export interface OtpRepository {
    get(id: string): Promise<Otp>

    create(params: Omit<OtpStruct, 'id' | 'attempts' | 'isVerified'>): Promise<Otp>;

    update(otp: Otp): Promise<void>;
}

@Injectable()
export class OtpRepositoryImpl implements OtpRepository {
    constructor(
        @Inject(ConfigSymbols.OtpConfig)
        private readonly otpConfig: OtpConfig,

        @Inject(FactorySymbols.OtpFactory)
        private readonly otpFactory: OtpFactory,

        @Inject(CacheSymbols.RedisCache)
        private readonly redis: Cache,
    ) {}

    async get(id: string): Promise<Otp> {
        const key = this.makeKey(id);
        const otpStringData = await this.redis.client.get(key);
        if (!otpStringData) {
            throw OtpException.NotFoundByKey(key);
        }
        let otpParsedData = JSON.parse(otpStringData);

        let otp = this.otpFactory.create({
            id: otpParsedData._id,
            receiver: otpParsedData._receiver,
            otpCode: otpParsedData._otpCode,
            isVerified: otpParsedData._isVerified,
            attempts: otpParsedData._attempts,
            expiresAt: otpParsedData._expiresAt
        });

        return otp;
    }

    async create(params: Omit<OtpStruct, 'id' | 'attempts' | 'isVerified'>): Promise<Otp> {
        const otpTtl = this.otpConfig.getOtpCacheTtl();

        const otp = this.otpFactory.create({ id: randomUUID(), attempts: 0, isVerified: false, ...params });

        const otpKey = this.makeKey(otp.id);

        await this.redis.client.setex(otpKey, otpTtl, JSON.stringify(otp));
        return otp;
    }

    async update(otp: Otp): Promise<void> {
        const otpKey = this.makeKey(otp.receiver);
        const otpTtl = await this.redis.client.ttl(otpKey);
        if (otpTtl > 0) {
            await this.redis.client.setex(otpKey, otpTtl, JSON.stringify(otp));
        }
    }

    private makeKey(id: string): string {
        return `otp:${id}`;
    }

}
