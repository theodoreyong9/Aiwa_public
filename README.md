# Aiwa

A voice agent on your phone that works with Claude across all your repositories.

This repository is what Aiwa is served from. The source of the application is private.

## Install

Download **Aiwa.apk** from the [latest release](https://github.com/theodoreyong9/Aiwa_public/releases/tag/android-latest) on your
Android phone and open it. A newer build installs over the previous one.

## What is here

- **The application**: the release `android-latest`.
- **The skills** (`skills/`): what a Claude session opened by Aiwa reads before it works. `skills/instructions/SKILL.md` holds the rules of
  every session and points to one skill per kind of file.
- **The kit** (`skills/kit/`): free music, footage and 3D assets with their licences, measured design references, and the video tools.
  The catalogues are extended every week by the workflows of this repository.

## How the application gets here

The workflow [Release](.github/workflows/release.yml) builds the application from the private source and publishes the APK as the
release `android-latest`. It runs every hour and publishes only when the source has changed. It reads the source with the
repository secret `AIWA_SOURCE_TOKEN`: a fine-grained token limited to reading the contents of the source repository.
