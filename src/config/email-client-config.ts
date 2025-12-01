import { Injectable } from "@nestjs/common";
import { AbstractConfig } from "./abstract-config";

export interface EmailAuth {
    user: string;
    pass: string;
}

export interface EmailClientConfig {
    getHost(): string;
    getPort(): number;
    getSecure(): boolean;
    getAuth(): EmailAuth;
    getUser(): string;
    getPass(): string;
    getEmail(): string;
}

@Injectable()
export class EmailClientConfigImpl extends AbstractConfig implements EmailClientConfig {
    private readonly host: string;
    private readonly port: number;
    private readonly secure: boolean;
    private readonly auth: EmailAuth;
    private readonly user: string;
    private readonly pass: string;
    private readonly email: string;

    constructor() {
        super();

        this.host = process.env.SMTP_HOST!;
        this.port = Number(process.env.SMTP_PORT || 0);
        this.secure = process.env.SMTP_SECURE === "true";
        this.user = process.env.SMTP_USER!;
        this.pass = process.env.SMTP_PASS!;
        this.auth = {
            user: this.user,
            pass: this.pass,
        }
        this.email = process.env.SMTP_EMAIL!;

        this.validateEnvs();
    }

    public getHost(): string {
        return this.host;
    }

    public getPort(): number {
        return this.port;
    }

    public getSecure(): boolean {
        return this.secure;
    }

    public getAuth(): EmailAuth {
        return this.auth;
    }

    public getUser(): string {
        return this.user;
    }

    public getPass(): string {
        return this.pass;
    }

    public getEmail(): string {
        return this.email;
    }

    private validateEnvs(): void | never {
        if(!this.host) {
            this.throwEnvError("SMTP_HOST")
        }
        if(!this.port) {
            this.throwEnvError("SMTP_TIMEOUT")
        }
        if(this.secure == null) {
            this.throwEnvError("SMTP_SECURE")
        }
        if(!this.user) {
            this.throwEnvError("SMTP_AUTH_USER")
        }
        if(!this.pass) {
            this.throwEnvError("SMTP_AUTH_PASS")
        }
        if(!this.email) {
            this.throwEnvError("SMTP_EMAIL")
        }
    }
}
