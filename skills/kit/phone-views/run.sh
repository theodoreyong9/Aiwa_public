#!/bin/bash
# The line the emulator runner calls (it runs each line of a script on its own: one file, one call). The tour comes from $TOUR (texts, comma separated).
IFS=',' read -r -a STEPS <<< "${TOUR:-Search,Wallet,Agent,Pages,Home}"
bash skills/kit/phone-views/capture.sh Aiwa.apk com.aiwa out aiwa.session skills/kit/phone-views/examples/aiwa-session.xml "${STEPS[@]}"
