# Apps

An application that installs or opens on the phone.

- The simplest first: a web app in a single file (the page skill) when it needs nothing of Android.
- A real Android application: an `.apk` signed with a FIXED debug key committed in the repository (otherwise each build is signed
  differently and does not install over the previous one), built by a GitHub Actions workflow on every push to the default branch and
  published as the file `<repository>.apk` of ONE release tagged `android-latest`, updated at each build.
- Say in one sentence what the app does and how to open it; installing asks for « unknown sources ».
- Test what can be tested (the build, the tests); say honestly what could not be tried on a real phone.
- An app that uses the wallet of Aiwa goes through `aiwa-lib` and never holds a key itself.
- Publish with the tag `app-…`.
