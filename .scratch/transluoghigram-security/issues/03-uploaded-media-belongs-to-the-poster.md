# 03: Uploaded media belongs to the account that posted it

**What to build:** Media attached while creating a post, or uploaded directly by a social account, is tied to that account. The client cannot assign the file to someone else. Another social account cannot replace or delete that file through REST or GraphQL. A CMS admin still can. Files already stored with no owner stay publicly readable, and only a CMS admin can change or delete them. The public feed still shows the image or video. These rules are explicit on Transluoghigram media, so they keep working after the site-wide write lock in 07.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Creating a post with a file records that file as owned by the signed-in account
- [ ] A direct upload by a social account is owned by that account, even if the request names a different owner
- [ ] A different social account cannot update or delete that file through REST or GraphQL
- [ ] A CMS admin can still update and delete any Transluoghigram media, including files that have no owner
- [ ] The public feed still renders the image or video for that post
