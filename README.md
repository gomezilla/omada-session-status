# Omada Session Status

Standalone static page for displaying Omada voucher and Wi-Fi session details. It has no build step or external dependencies.

## Publish with GitHub Pages

1. Create a GitHub repository named `omada-session-status`.
2. Upload the files in this folder to the repository root.
3. In the repository, open **Settings > Pages**.
4. Choose **Deploy from a branch**, select `main` and the `/ (root)` folder, then save.
5. GitHub Pages will provide a public URL for the page.

## Connect the Omada portal

Set the Omada portal's post-auth landing URL to the GitHub Pages URL. Then deploy the updated captive portal `index.js` from the parent project folder. On successful voucher login, it forwards the voucher code and client MAC in the URL fragment; the fragment is readable by this page but is not sent to GitHub's web server.

When Omada's authentication redirect includes its logout URL (`apiDomain` and `cliToken`), the captive portal script calls `/portal/getLogoutPageSetting` from the Omada portal origin using the browser's Omada session. It forwards only `username`, `ip`, `uptime`, `timeUsed`, `timeLeft`, and the client MAC to GitHub Pages in the URL fragment. The API token and cookies are not forwarded.

This API call depends on the portal running at an origin allowed by Omada's credentialed CORS policy and on the logout URL containing the required parameters. GitHub Pages itself cannot call the controller API directly. If Omada does not supply those parameters, the page displays a note instead of live details.

## Session parameters

The page reads optional values from its URL:

| Detail | Accepted parameters |
| --- | --- |
| Voucher code | `voucherCode`, `voucher`, `code` |
| MAC address | `clientMac`, `mac`, `macAddress` |
| IP address | `clientIp`, `clientIP`, `ipAddress`, `ip` |
| Username | `username` |
| Duration | `duration` and optional `durationUnit` or `unit` |
| Session start | `startedAt`, `startTime`, `sessionStart` |
| Expiry | `expiresAt`, `expiryTime`, `expirationTime` |
| Time used seconds | `timeUsed`, `uptime`, `usedSeconds` |
| Remaining seconds | `remainingSeconds`, `timeRemainingSeconds`, `timeLeft` |

Duration units include hours, days, weeks, months, and years. Omada must provide session values in the URL or through a separate backend; a public static page cannot look up private live session data by itself.

Example:

`?voucherCode=GUEST123&clientMac=AA:BB:CC:DD:EE:FF&clientIp=192.168.1.25&duration=7&durationUnit=days&startedAt=2026-10-28T10:00:00`