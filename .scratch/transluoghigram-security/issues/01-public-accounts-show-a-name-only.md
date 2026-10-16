# 01: Public accounts show a name only

**What to build:** The Transluoghigram feed and the public account API still show who posted, and they no longer include email addresses. This holds for REST and GraphQL, including when a post is loaded with its owner populated. A CMS admin can still see emails in the admin panel. A logged-in account can still see its own email, and it cannot see the email of any other account.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] An anonymous request for the account list, a single account, or a post with its owner populated returns the display name and does not return email, on REST and on GraphQL
- [ ] A logged-in social account gets the same redaction when it reads any account other than its own
- [ ] The same requests do not return password hashes, reset tokens, or session records
- [ ] A CMS admin can still read account emails in the admin panel
- [ ] A logged-in social account can still read its own email
