#!/bin/bash
# Real phone views of an Android application: the real APK, run in an emulator (this is meant to run inside the emulator runner of a GitHub workflow, see .github/workflows/phone-views.yml).
#   capture.sh APK PACKAGE OUT_DIR [SEED_PREFS_NAME SEED_XML] [TOUR: texts of the buttons to touch, in order]
# It installs the APK, grants the microphone, optionally seeds a SharedPreferences file (a debug APK only: run-as), takes a screenshot of the first screen, then records a tour
# (screenrecord) touching each text in turn (found with uiautomator, no coordinates) and takes a screenshot after each. Nothing is invented: what is shown is what the app shows.
set -u
APK=$1; PKG=$2; OUT=$3; PREFS=${4:-}; SEED=${5:-}; shift 5 2>/dev/null || shift 3; TOUR=("$@")
mkdir -p "$OUT"; HERE=$(cd "$(dirname "$0")" && pwd)
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 2; done
sleep 25      # the launcher of a fresh emulator is slow: let it settle (otherwise « Pixel Launcher isn't responding » covers the screen)
adb shell input keyevent 82 >/dev/null 2>&1
adb install -r -g "$APK" || { echo "INSTALL FAILED"; adb shell getprop ro.product.cpu.abilist; exit 1; }
adb shell pm grant "$PKG" android.permission.RECORD_AUDIO 2>/dev/null
shot() { adb exec-out screencap -p > "$OUT/$1.png"; }
dismiss() { for w in "Close app" "Fermer"; do python3 "$HERE/tap.py" "$w" >/dev/null 2>&1 && echo "closed a system dialog"; done; adb shell am force-stop com.google.android.apps.nexuslauncher >/dev/null 2>&1; }      # an ANR dialog of the emulator's own launcher: close it and stop the launcher (the application stays in front)
tap() { dismiss; python3 "$HERE/tap.py" "$1" && sleep "${2:-2}"; }
# 1. the first opening as a new user sees it
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 8; shot first-opening
adb shell am force-stop "$PKG"
# 2. the state of a finished first opening (only what the app itself would write), then the real screens
if [ -n "$PREFS" ] && [ -n "$SEED" ]; then
  adb push "$SEED" /data/local/tmp/seed.xml >/dev/null
  adb shell "run-as $PKG sh -c 'mkdir -p shared_prefs && cp /data/local/tmp/seed.xml shared_prefs/$PREFS.xml'" || echo "SEED FAILED (not a debug build?)"
fi
dismiss; adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 8; dismiss; shot home-screen
adb shell screenrecord --size 720x1560 --bit-rate 10000000 --time-limit 120 /sdcard/tour.mp4 &
REC=$!; sleep 2
for t in "${TOUR[@]}"; do tap "$t" 3 || echo "NOT FOUND: $t"; n=$(echo "$t" | tr -c 'A-Za-z0-9' '_'); shot "after-$n"; done
sleep 2; adb shell pkill -2 screenrecord; wait $REC 2>/dev/null; sleep 2
adb pull /sdcard/tour.mp4 "$OUT/tour.mp4"; adb shell dumpsys window displays | grep -m1 "init=" > "$OUT/display.txt"; adb logcat -d -t 400 > "$OUT/logcat.txt"
ls -la "$OUT"
