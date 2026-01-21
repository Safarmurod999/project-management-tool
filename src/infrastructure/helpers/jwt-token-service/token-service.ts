import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../token-service';

@Injectable()
export class TokenServiceImpl implements TokenService {
  constructor(private readonly jwt: JwtService) {}

  public generateToken<Payload extends object>(
    payload: Payload,
    secret: string,
    expiresIn: number,
  ): string {
    return this.jwt.sign(payload, { secret, expiresIn });
  }

  public getExpiresAt(token: string): Date {
    const decoded = this.jwt.decode(token, { json: true });

    if (!decoded || typeof decoded !== 'object' || decoded === null) {
      throw new Error('Error occurred while decoding the token');
    }

    const jwtPayload = decoded as JwtPayload;
    
    if (!jwtPayload.exp) {
      throw new Error('Token expiration information not found');
    }

    return new Date(jwtPayload.exp * 1000);
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
    const decoded = this.jwt.decode(token, { json: true });
    
    if (!decoded || typeof decoded !== 'object' || decoded === null) {
      return null;
    }
    
    return decoded as Payload & JwtPayload;
  }
}