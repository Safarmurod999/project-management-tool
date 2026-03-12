# Real-time (Socket.IO)

## Connection

The Socket.IO server shares the same host and port as the HTTP API.

- Default URL: `http://localhost:3000`
- CORS origins: `SOCKET_CORS_ORIGIN` (comma-separated list)

## Authentication

Provide the access token on connect:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken,
  },
});
```

The gateway validates the JWT using `ACCESS_SECRET` and joins the user room `user:{userId}`.

## Events

### Client -> Server

- `ping`
  - payload: `{ clientTime?: string }`

### Server -> Client

- `pong`
  - payload: `{ serverTime: string, clientTime?: string }`

## Server-side Emitting

Inject the realtime service and emit to a user or room:

```ts
constructor(
  @Inject(ServiceSymbols.RealtimeService)
  private readonly realtime: RealtimeService,
) {}

this.realtime.emitToUser(userId, 'user.updated', { userId });
```
