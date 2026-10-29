# Cb++ (Chromium)

Cb++ adds client-side controls and display options to ChatBlink.

## Features

- Add **Ignore** beside members in a room's online-member list.
- Add a compact eye/eye-slash control beside chat message actions to hide or
  show that sender's messages.
- Save ignored members in local extension storage. Ignoring only hides their
  messages in your browser.
- The extension stores settings locally and does not collect or transmit data.
- Use the extension popup to switch **True Dark Mode**, **Hide Ads**, and
  **Hide Online members** on or off across ChatBlink pages.
- View the number of ignored members and reset the full ignore list from the
  popup.

In dark mode, the text in private-message bubbles is also made white.

## Load in a Chromium-based browser

1. Open `chrome://extensions` (or the equivalent extensions page in your
   Chromium-based browser).
2. Turn on **Developer mode**.
3. Select **Load unpacked** and choose this folder.
4. Open a page under `https://www.chatblink.com/` and use the extension icon
   to access the popup settings.

The extension uses Manifest V3 and Chromium's `chrome.storage` API. To
distribute it to other users, package it for the target browser's extension
store and follow that store's publishing requirements.
