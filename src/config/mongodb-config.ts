import { Injectable } from "@nestjs/common";
import { AbstractConfig } from "./abstract-config";

export interface MongoDbConfig {
	getHost(): string;
	getPort(): number;
	getDbName(): string;
	getUsername(): string;
	getPassword(): string;
}

@Injectable()
export class MongoDbConfigImpl extends AbstractConfig implements MongoDbConfig {
	private readonly host: string;
	private readonly port: number;
	private readonly dbName: string;
	private readonly username: string;
	private readonly password: string;

	constructor() {
		super();

		this.host = process.env.DATABASE_HOST || "";
		this.port = Number(process.env.DATABASE_PORT || null);
		this.dbName = process.env.DATABASE_NAME || "";
		this.username = process.env.DATABASE_USERNAME || "";
		this.password = process.env.DATABASE_PASSWORD || "";

		this.validateEnvs();
	}

	public getHost(): string {
		return this.host;
	}

	public getPort(): number {
		return this.port;
	}

	public getDbName(): string {
		return this.dbName;
	}

	public getUsername(): string {
		return this.username;
	}

	public getPassword(): string {
		return this.password;
	}

	private validateEnvs(): void | never {
		if(!this.host) {
			this.throwEnvError("DATABASE_HOST")
		}
		if(!this.port) {
			this.throwEnvError("DATABASE_PORT")
		}
		if(!this.dbName) {
			this.throwEnvError("DATABASE_NAME")
		}
	}
}
