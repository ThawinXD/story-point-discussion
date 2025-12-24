# A Planning Poker

Estimation using Planning Poker!

## Server REPL (dev)
- Start backend: `cd story-point-discussion/backend && npm run dev`
- When the server starts, a `server>` prompt appears.
- Type expressions/functions and see results logged:
	- `env` — view environment config
	- `cmd.listRooms()` — list active room IDs
	- `rooms` — inspect in-memory room state
	- `cmd.emitToRoom('room123','newMessage',{ name:'Dev', message:'Hello'})`

The REPL runs inside the server process; anything you call can interact with `io`, `rooms`, and `users`.