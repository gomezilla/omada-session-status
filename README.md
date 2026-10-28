# Omada Session Status

Standalone static page for displaying Omada voucher and Wi-Fi session details. It has no build step or external dependencies.

## Publish with GitHub Pages

1. Create a GitHub repository named `omada-session-status`.
2. Upload the files in this folder to the repository root.
3. In the repository, open **Settings > Pages**.
4. Choose **Deploy from a branch**, select `main` and the `/ (root)` folder, then save.
5. GitHub Pages will provide a public URL for the page.

## Session parameters

The page reads optional values from its URL:

| Detail | Accepted parameters |
| --- | --- |
| Voucher code | `voucherCode`, `voucher`, `code` |
| MAC address | `clientMac`, `mac`, `macAddress` |
| IP address | `clientIp`, `clientIP`, `ipAddress`, `ip` |
| Duration | `duration` and optional `durationUnit` or `unit` |
| Session start | `startedAt`, `startTime`, `sessionStart` |
| Expiry | `expiresAt`, `expiryTime`, `expirationTime` |
| Remaining seconds | `remainingSeconds`, `timeRemainingSeconds` |

Duration units include hours, days, weeks, months, and years. Omada must provide session values in the URL or through a separate backend; a public static page cannot look up private live session data by itself.

Example:

`?voucherCode=GUEST123&clientMac=AA:BB:CC:DD:EE:FF&clientIp=192.168.1.25&duration=7&durationUnit=days&startedAt=2026-10-28T10:00:00`