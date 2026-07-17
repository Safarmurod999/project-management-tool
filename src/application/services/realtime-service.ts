export interface RealtimeService {
  emitToUser(userId: string, event: string, payload: unknown): void;
  emitToRoom(room: string, event: string, payload: unknown): void;
  broadcast(event: string, payload: unknown): void;
}
