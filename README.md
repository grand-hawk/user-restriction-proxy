# user-restriction-proxy

This is a work in progress project to proxy user restrictions from Roblox to see if a user is banned in a predefined list of universes.
This uses Redis caching as a request to Roblox's servers can take 200ms+.

### Environment variables

| Variable               | Description                                                              | Default Value            | Required |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------ | -------- |
| `HOSTNAME`             | The hostname for the server.                                             | `0.0.0.0`                | No       |
| `PORT`                 | The port number the server will listen on.                               | `3000`                   | No       |
| `AUTHORIZATION_HEADER` | The optional required string as the `Authorization` header's value.      | N/A                      | No       |
| `REDIS`                | URL for the Redis server.                                                | `redis://localhost:6379` | No       |
| `REDIS_EXPIRY`         | Time in seconds for the Redis cache expiry.                              | `3600`                   | No       |
| `UNIVERSE_IDS`         | A comma-separated list of universe IDs, parsed into an array of numbers. | `""` (empty array)       | No       |
| `API_KEY`              | Your API key required for authenticating requests.                       | N/A                      | Yes      |
