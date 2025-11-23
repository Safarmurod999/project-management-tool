import { Injectable } from "@nestjs/common";
import { AbstractConfig } from "./abstract-config";

export interface RedisConfig {
	getHost(): string;
	getPort(): number;
	getDbIndex(): number;
	getUsername(): string;
	getPassword(): string;
}

@Injectable()
export class RedisConfigImpl extends AbstractConfig implements RedisConfig {
	private readonly host: string;
	private readonly port: number;
	private readonly dbIndex: number;
	private readonly username: string;
	private readonly password: string;

	constructor() {
		super();

		this.host = process.env.REDIS_HOST || "";
		this.port = Number(process.env.REDIS_PORT || null);
		this.dbIndex = Number(process.env.REDIS_DB_INDEX || null);
		this.username = process.env.REDIS_USERNAME || "";
		this.password = process.env.REDIS_PASSWORD || "";

		this.validateEnvs();
	}

	public getHost(): string {
		return this.host;
	}

	public getPort(): number {
		return this.port;
	}

	public getDbIndex(): number {
		return this.dbIndex;
	}

	public getUsername(): string {
		return this.username;
	}

	public getPassword(): string {
		return this.password;
	}

	private validateEnvs(): void | never {
		if(!this.host) {
			this.throwEnvError("REDIS_HOST")
		}
		if(!this.port) {
			this.throwEnvError("REDIS_PORT")
		}
		if(this.dbIndex === null || this.dbIndex === undefined) {
			this.throwEnvError("REDIS_DB_INDEX")
		}
	}
}
