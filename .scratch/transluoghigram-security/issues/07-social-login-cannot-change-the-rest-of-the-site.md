# 07: A social login cannot change the rest of the site

**What to build:** A Transluoghigram session can still use the feed and its own account. It cannot create, update, or delete CMS admin users, site content, site uploads, or globals, over REST or GraphQL. Anonymous visitors can still read the public site. A CMS admin can still change all of it. Own posts, own Transluoghigram media, and the caller's own account stay governed by tickets 02, 03, and 04. Until those land, this ticket must leave the account page able to create a post.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A social account cannot create, update, or delete CMS admin users, on REST or on GraphQL
- [ ] A social account cannot create, update, or delete site content, site media, site video, tracks, or globals, on REST or on GraphQL
- [ ] An anonymous visitor can still read the public site
- [ ] A CMS admin can still create, update, and delete those same resources
- [ ] After this ticket alone, a social account can still create a post from the account page
