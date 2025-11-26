import { Injectable } from '@nestjs/common';
import { TokenService } from '../token-service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class TokenServiceImpl implements TokenService {
  constructor(private readonly jwt: JwtService) {}

  public generateToken(
    payload: Record<string, any>,
    secret: string,
    expiresIn: number,
  ): string {
    return this.jwt.sign(payload, { secret, expiresIn });
  }

  public getExpiresAt(token: string): Date {
    const decoded = this.jwt.decode(token) as JwtPayload | null;

    if (!decoded || typeof decoded !== 'object') {
      throw new Error(
        'Error occurred while decoding the token',
      );
    }

    if (!decoded.exp) {
      throw new Error('Token expiration information not found');
    }

    return new Date(decoded.exp * 1000);
  }

  public isValidToken(token: string, secret: string): boolean {
    try {
      this.jwt.verify(token, { secret });
      return true;
    } catch {
      return false;
    }
  }

  public parseToken<Payload extends object>(
    token: string,
  ): (Payload & JwtPayload) | null {
    return this.jwt.decode(token, { json: true }) as Payload & JwtPayload;
  }
}
