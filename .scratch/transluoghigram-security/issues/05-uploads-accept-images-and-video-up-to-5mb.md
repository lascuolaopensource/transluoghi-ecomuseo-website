# 05: Uploads accept only images and video, up to 5 MB

**What to build:** A normal photo or video still attaches to a post from the account page. An SVG, any other type, or a file over 5 MB is rejected on the account form and on REST and GraphQL. The limit is enforced where the file is stored, not only in the form. Files already stored are left in place.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A JPEG, PNG, WebP, GIF, MP4, or WebM at or under 5 MB still uploads from the account page and appears on the post
- [ ] An SVG is rejected on the account form, on REST, and on GraphQL
- [ ] A file over 5 MB is rejected on the account form, on REST, and on GraphQL
- [ ] A file is rejected when its contents do not match an allowed type, even if the client declares an allowed type
- [ ] This ticket does not delete or rewrite media that is already stored
