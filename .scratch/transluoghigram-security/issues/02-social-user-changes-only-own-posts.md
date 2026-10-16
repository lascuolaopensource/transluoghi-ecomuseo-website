# 02: A social user can change only their own posts

**What to build:** From the account page, create, edit, and delete still work on your posts. Through REST and GraphQL, another social account cannot edit, delete, or take over someone else's post. A create that names a different owner is stored as the caller, not as the owner the client sent. A CMS admin still can change any post. These rules are explicit on the post collection, so they keep working after the site-wide write lock in 07. Failures shown in the account UI stay generic and do not echo internal exception text.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The account page still creates, edits, and deletes the signed-in account's own posts
- [ ] A social account cannot update or delete a post it does not own, on REST or on GraphQL, and cannot reassign that post to itself
- [ ] A social account that creates a post while sending another account as owner ends up as the owner of the new post
- [ ] A CMS admin can still update and delete any post
- [ ] A failed create, edit, or delete on the account page returns a generic message, not the underlying exception text
