#!/bin/bash
# The line the emulator runner calls (it runs each line of a script on its own: one file, one call). The tour comes from $TOUR (texts, comma separated).
IFS=',' read -r -a STEPS <<< "${TOUR:-Search,Wallet,Agent,Pages,Home}"
sed "s/name=\"language\">en/name=\"language\">${LANG_CODE:-en}/" skills/kit/phone-views/examples/aiwa-session.xml > /tmp/seed.xml
bash skills/kit/phone-views/capture.sh Aiwa.apk com.aiwa out aiwa.session /tmp/seed.xml "${STEPS[@]}"
