import { Injectable } from '@nestjs/common';
import { AbstractConfig } from './abstract-config';

export interface AuthConfig {
  getAccessSecret(): string;
  getAccessSecretExpiresIn(): number;
  getRefreshSecret(): string;
  getRefreshSecretExpiresIn(): number;
}

@Injectable()
export class AuthConfigImpl extends AbstractConfig implements AuthConfig {
  private readonly accessSecret: string;
  private readonly accessSecretExpiresIn: number;
  private readonly refreshSecret: string;
  private readonly refreshSecretExpiresIn: number;

  constructor() {
    super();

    this.accessSecret = process.env.ACCESS_SECRET!;
    this.accessSecretExpiresIn = 3600; // 1 hour
    this.refreshSecret = process.env.REFRESH_SECRET!;
    this.refreshSecretExpiresIn = 86400; // 24 hours

    this.validateEnvs();
  }

  public getAccessSecret(): string {
    return this.accessSecret;
  }

  public getAccessSecretExpiresIn(): number {
    return this.accessSecretExpiresIn;
  }

  public getRefreshSecret(): string {
    return this.refreshSecret;
  }

  public getRefreshSecretExpiresIn(): number {
    return this.refreshSecretExpiresIn;
  }

  private validateEnvs(): void | never {
    if (!this.accessSecret) {
      this.throwEnvError('ACCESS_SECRET');
    }

    if (!this.accessSecretExpiresIn) {
      this.throwEnvError('ACCESS_SECRET_EXPIRES_IN');
    }

    if (!this.refreshSecret) {
      this.throwEnvError('REFRESH_SECRET');
    }

    if (!this.refreshSecretExpiresIn) {
      this.throwEnvError('REFRESH_SECRET_EXPIRES_IN');
    }
  }
}
