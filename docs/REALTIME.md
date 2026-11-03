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
- `project:join`
  - payload: `projectId` (string). Joins the room `project:{projectId}` to receive the project events below.

### Server -> Client

- `pong`
  - payload: `{ serverTime: string, clientTime?: string }`

Emitted to `project:{projectId}`:

- `board:created` — the new board. Its default columns (To Do / In Progress / Done) and status mappings already exist when this fires.
- `status:created` — `{ id, projectId, name, code, color, order, isDefault, version, createdAt, updatedAt }`
- `status:updated` — same payload as `status:created`
- `status:deleted` — `{ id, projectId }`
- `workflow:created` — the workflow with `statuses` and `transitions` (same shape as `GET /workflows/:id`)
- `workflow:updated` — same payload; sent for configuration changes and for added/removed statuses and transitions
- `workflow:deleted` — `{ id, projectId }`

## Server-side Emitting

Inject the realtime service and emit to a user or room:

```ts
constructor(
  @Inject(ServiceSymbols.RealtimeService)
  private readonly realtime: RealtimeService,
) {}

this.realtime.emitToUser(userId, 'user.updated', { userId });
```
