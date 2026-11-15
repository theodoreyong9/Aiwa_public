# Connecting devices

A device is anything that is not the phone's own screen, microphone and speaker: a Bluetooth headset or speaker, a wired headset, a USB device, a
screen or a television, a serial board. This skill covers two things: helping her connect one, and building a page or an application that uses one.

## Helping her connect one

Her agent can open the Bluetooth settings of the phone (`open` with the place `bluetooth`) and, in the settings of Aiwa, « Voice and ear » lets her
choose the device the agent speaks through and listens to (Android 12 and later). A session does not touch the phone: it writes the steps, in her language,
short, one per line, and the agent says them.

- **Bluetooth headset or speaker**: switch it on and put it in pairing mode (the light blinks); on the phone, Settings, Bluetooth, the device in the list of
  available devices, pair; then in Aiwa, Settings, « Voice and ear », choose it. If the agent hears itself or does not hear her, a wired or Bluetooth headset
  is the surest remedy: the speaker next to the microphone is what makes an agent hear itself.
- **A device that does not appear**: switch Bluetooth off and on, remove the old pairing (« forget this device ») and pair again; check that the device is not
  connected to another phone or computer; charge it.
- **A television or a screen** (cast): the phone and the television must be on the same network.

## Building for a device

Use the standard interface of the platform; ask for the permission when the person acts, never at start; always have a way that works without the device.

| Device | In a page | In an Android application |
|---|---|---|
| microphone, camera | `navigator.mediaDevices.getUserMedia`; choose with `enumerateDevices()` | `RECORD_AUDIO`, `CAMERA`; `AudioManager.setCommunicationDevice` (Android 12) to route |
| speaker or headset | `HTMLMediaElement.setSinkId()` (where supported) | `AudioManager`, `AudioDeviceInfo` |
| Bluetooth (low energy) | Web Bluetooth (Chrome on Android, a user gesture, HTTPS) | `BluetoothLeScanner`; from Android 12 `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` |
| USB, serial | WebUSB, Web Serial (a user gesture, HTTPS, desktop Chrome mostly) | `UsbManager` and the permission dialog |
| position | `navigator.geolocation` | `ACCESS_FINE_LOCATION` |

- A page cannot list devices without a gesture and a choice by the person: build the button, not the automatic scan.
- A device that goes away (the headset is switched off) is a normal event: listen to it (`devicechange`, `onDisconnect`), say it, fall back to the phone.
- Never keep the identifier of a device longer than the session unless she asked; it identifies her.
- Test with the real device when she has one; otherwise say in the notes of the release that the device code was not run against hardware.
