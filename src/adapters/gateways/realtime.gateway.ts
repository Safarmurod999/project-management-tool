import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from 'src/application';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection';
import { TokenService } from 'src/infrastructure/helpers/token-service';

interface AccessTokenPayload {
  userId: string;
}

interface PingPayload {
  clientTime?: string;
}

interface PongPayload {
  serverTime: string;
  clientTime?: string;
}

const parseCorsOrigins = (value?: string): string | string[] => {
  if (!value) {
    return 'http://localhost:5173';
  }

  const normalized = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return 'http://localhost:5173';
  }

  return normalized.length === 1 ? normalized[0] : normalized;
};

const socketCorsOrigin = parseCorsOrigins(process.env.SOCKET_CORS_ORIGIN);

@WebSocketGateway({
  cors: {
    origin: socketCorsOrigin,
    credentials: true,
  },
})
export class RealtimeGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    RealtimeService
{
  @WebSocketServer()
  private server?: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    @Inject(ServiceSymbols.TokenService)
    private readonly tokenService: TokenService,
  ) {}

  afterInit(): void {
    this.logger.log('Socket.IO gateway initialized');
  }

  handleConnection(client: Socket): void {
    const token = this.resolveToken(client);
    const accessSecret = this.getAccessSecret();

    if (
      !token ||
      !accessSecret ||
      !this.tokenService.isValidToken(token, accessSecret)
    ) {
      this.logger.warn(
        `Socket rejected: invalid token (socketId=${client.id})`,
      );
      client.disconnect(true);
      return;
    }

    const payload = this.tokenService.parseToken<AccessTokenPayload>(token);

    if (!payload?.userId) {
      this.logger.warn(
        `Socket rejected: missing userId (socketId=${client.id})`,
      );
      client.disconnect(true);
      return;
    }

    client.data.userId = payload.userId;
    client.join(this.userRoom(payload.userId));

    this.logger.log(
      `Socket connected: userId=${payload.userId} socketId=${client.id}`,
    );
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId;

    if (userId) {
      this.logger.log(
        `Socket disconnected: userId=${userId} socketId=${client.id}`,
      );
      return;
    }

    this.logger.log(`Socket disconnected: socketId=${client.id}`);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    if (!this.server) {
      this.logger.warn('Socket server is not ready yet');
      return;
    }

    this.server.to(this.userRoom(userId)).emit(event, payload);
  }

  emitToRoom(room: string, event: string, payload: unknown): void {
    if (!this.server) {
      this.logger.warn('Socket server is not ready yet');
      return;
    }

    this.server.to(room).emit(event, payload);

    this.logger.debug(`emitted to room: (event=${event})`);
  }

  broadcast(event: string, payload: unknown): void {
    if (!this.server) {
      this.logger.warn('Socket server is not ready yet');
      return;
    }

    this.server.emit(event, payload);
  }

  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() payload: PingPayload,
    @ConnectedSocket() client: Socket,
  ): WsResponse<PongPayload> {
    const response: PongPayload = {
      serverTime: new Date().toISOString(),
      clientTime: payload?.clientTime,
    };

    this.logger.debug(`Ping received (socketId=${client.id})`);

    return { event: 'pong', data: response };
  }

  @SubscribeMessage('project:join')
  handleJoinProject(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`project:${projectId}`);
    this.logger.debug(`Ping received (socketId=${client.id})`);
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  private resolveToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken.trim();
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
      return queryToken.trim();
    }

    const authHeader = client.handshake.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring('Bearer '.length).trim();
    }

    return null;
  }

  private getAccessSecret(): string | null {
    return process.env.ACCESS_SECRET ?? null;
  }
}
