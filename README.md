# user-restriction-proxy

This is a work in progress project to proxy user restrictions from Roblox to see if a user is banned in a predefined list of universes.
This uses Redis caching as a request to Roblox's servers can take 200ms+.

### Environment variables

| Variable                              | Description                                                                                         | Default Value              | Required |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------- | -------- |
| `HOSTNAME`                            | The hostname for the server.                                                                        | `"0.0.0.0"`                | No       |
| `PORT`                                | The port number the server will listen on.                                                          | `3000`                     | No       |
| `INFISICAL_WORKSPACE_ID`              | The Infisical workspace ID.                                                                         | N/A                        | No       |
| `INFISICAL_SERVICE_TOKEN`             | The Infisical service token.                                                                        | N/A                        | No       |
| `INFISICAL_ENVIRONMENT`               | The Infisical environment.                                                                          | `"prod"`                   | No       |
| `AUTHORIZATION`                       | The optional required string as the `Authorization` header's value.                                 | N/A                        | No       |
| `AUTHORIZATION_INFISICAL_SECRET_PATH` | The path to the Infisical secret containing the value for the `AUTHORIZATION` environment variable. | N/A                        | No       |
| `API_KEY`                             | Your API key required for authenticating requests.                                                  | N/A                        | Yes      |
| `API_KEY_INFISICAL_SECRET_PATH`       | The path to the Infisical secret containing the value for the `API_KEY` environment variable.       | N/A                        | No       |
| `REDIS`                               | URL for the Redis server.                                                                           | `"redis://localhost:6379"` | No       |
| `REDIS_EXPIRY`                        | Time in seconds for the Redis cache expiry.                                                         | `3600`                     | No       |
| `UNIVERSE_IDS`                        | A comma-separated list of universe IDs, parsed into an array of numbers.                            | `""` (empty array)         | No       |
| `TIMEOUT_BACKOFF`                     | Maximum time in seconds to retry requests after a timeout error.                                    | `30`                       | No       |

## Sample request

GET `/user-restrictions/:userId`

```ts
// https://create.roblox.com/docs/en-us/cloud/reference/UserRestriction#Get-User-Restriction
type Response = Record<string, UserRestriction['gameJoinRestriction'] | null>;
```

```json
{
  "<universe-id>": {
    "active": false,
    "privateReason": "",
    "displayReason": "",
    "excludeAltAccounts": false,
    "inherited": false
  },
  "<universe-id>": {
    "active": true,
    "startTime": "2025-02-18T21:23:45+00:00",
    "privateReason": "Private reason",
    "displayReason": "Display reason",
    "excludeAltAccounts": false,
    "inherited": false
  }
}
```
