# 04: A social user can change only their own account

**What to build:** Login stays as it is, and anonymous registration stays closed. A social account may update only its own account, and it cannot rename, change the email of, set a new password on, unlock, or delete a different account through REST or GraphQL. A CMS admin still can manage accounts. This allow is explicit, so it keeps working after the site-wide write lock in 07.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] An anonymous client still cannot register a social account, on REST or on GraphQL
- [ ] Login with an existing social account still reaches the account page
- [ ] A social account cannot update, unlock, or delete a different social account through REST or GraphQL
- [ ] A social account can still update its own account record
- [ ] A CMS admin can still create, update, and delete social accounts
