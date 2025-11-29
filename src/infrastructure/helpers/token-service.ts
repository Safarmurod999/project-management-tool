import { JwtPayload } from "jsonwebtoken";

export interface TokenService {
	generateToken(payload: Record<string, any>, secret: string, expiresIn: number	): string;
	getExpiresAt(token: string): Date;
	isValidToken(token: string, secret: string): boolean
	parseToken<Payload extends object>(token: string): Payload & JwtPayload | null;
}
