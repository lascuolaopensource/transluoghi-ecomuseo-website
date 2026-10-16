# 08: Transluoghigram and the admin panel use different auth cookies

**What to build:** Logging into Transluoghigram no longer replaces the CMS admin session, and logging into the admin panel no longer replaces the Transluoghigram session. Logging out of one leaves the other signed in. Both cookies stay HttpOnly and SameSite Lax, and both follow the Secure rule from 06.

**Blocked by:** 06: Sessions stay on HTTPS, and the app will not boot without a secret.

**Status:** ready-for-agent

- [ ] After signing into both the admin panel and Transluoghigram in the same browser, both sessions are present at once
- [ ] Signing into one does not sign the other out
- [ ] Signing out of one leaves the other signed in
- [ ] Both cookies are HttpOnly and SameSite Lax, and both are Secure in production
