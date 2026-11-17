#!/usr/bin/env python3
"""tap.py TEXT | @X|Y: touch the first visible element whose text or content description contains TEXT (case-insensitive), found with uiautomator: no coordinates to maintain."""
import re, subprocess, sys, xml.etree.ElementTree as ET
raw = sys.argv[1]; want = raw.lower()
if raw.startswith('T:'):      # type a text into the focused field (ASCII only: adb input text)
    subprocess.run(['adb', 'shell', 'input', 'text', raw[2:].replace(' ', '%s')]); print('typed', raw[2:]); sys.exit(0)
if raw.startswith('S:'):      # a swipe: S:X1|Y1|X2|Y2 (to scroll a list)
    x1, y1, x2, y2 = raw[2:].split('|'); subprocess.run(['adb', 'shell', 'input', 'swipe', x1, y1, x2, y2, '400']); print('swiped'); sys.exit(0)
if want.startswith('@'):      # a raw tap, for an icon with no text: @X|Y in pixels of the screen
    x, y = want[1:].split('|'); subprocess.run(['adb', 'shell', 'input', 'tap', x, y]); print('tapped', x, y); sys.exit(0)
for _ in range(4):
    raw = subprocess.run(['adb', 'exec-out', 'uiautomator', 'dump', '/dev/tty'], capture_output=True, text=True).stdout
    raw = raw[raw.find('<?xml'):raw.rfind('</hierarchy>') + 12]
    try: root = ET.fromstring(raw)
    except ET.ParseError: continue
    for n in root.iter('node'):
        label = (n.get('text') or '') + ' ' + (n.get('content-desc') or '')
        if want in label.lower():
            x1, y1, x2, y2 = map(int, re.findall(r'\d+', n.get('bounds')))
            subprocess.run(['adb', 'shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2)]); print('tapped', want, (x1 + x2) // 2, (y1 + y2) // 2); sys.exit(0)
sys.exit(1)
