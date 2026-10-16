# 09: Cookie auth accepts only this site's origin

**What to build:** A request that carries an auth cookie and a foreign Origin is treated as logged out. The account page, the admin panel, and same-origin API calls from this site still authenticate. Login and logout from this site still work.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A request with the auth cookie and an Origin on another site is rejected as unauthenticated, for both the admin session and the Transluoghigram session
- [ ] Same-origin use of the account page and the admin panel still authenticates
- [ ] Login and logout submitted from this site still succeed
