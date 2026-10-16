# 06: Sessions stay on HTTPS, and the app will not boot without a secret

**What to build:** In production every auth cookie is marked Secure, including the CMS admin cookie and the Transluoghigram cookie if they have already been split. If the payload secret is missing, empty, or only whitespace, the process fails on startup instead of signing tokens with an empty secret.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] With the app in production mode, every auth cookie is set with Secure
- [ ] Local development over HTTP can still log in to the admin panel and to Transluoghigram
- [ ] Starting the app with a missing, empty, or whitespace-only payload secret fails before it serves requests
