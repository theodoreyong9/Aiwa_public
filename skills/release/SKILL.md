# Publishing a file

Everything made for the person is an asset of a GitHub release of the repository you work on. It is what « My files » lists on her phone.

1. The kind, which starts the tag: `skill`, `scenario`, `profile`, `app`, `docs`, `slides`, `note`, `image`, `video`, `page`, `game`,
   `contract`, `other`.
2. The tag: `<kind>-<short-name>-<YYYYMMDD>`, lower case, no space (`docs-cv-20261113`).
3. One file per release, clearly named, with the right extension. Its card of recipients, when it has one, goes in the same release
   (`<file>.targets.json`, see the rules).
4. The title of the release: a short sentence she understands without context (« CV of Julie, English version »), in her language.
5. The notes: what it is, the assumptions you made, what you could not verify.
6. A correction asked later is a NEW release (a new date in the tag), never a silent change of the old one.
7. Never commit the produced file into the code. Deleting a file on her phone deletes its release and its tag: nothing else may depend on them.

Quality follows the request: a simple letter stays simple, a careful dossier takes care. Add nothing that was not asked.
8. A cloud session may not be allowed to create releases (GitHub answers 403, « not permitted for this session type »). Then do not give up and do not
   commit the file into the code: put it on YOUR OWN working branch, in the folder `.aiwa-outbox/<tag>/` (one folder per release, the tag as the name of the
   folder, every file of that release inside it, its card of recipients too), and push. Her phone reads that folder, makes the release with her key, uploads
   the files and removes them from the branch. Say in your last message that the files are waiting there, never that they are published.
