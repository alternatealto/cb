# Cb++ (Firefox)

Cb++ adds client-side controls and display options to ChatBlink.

## Features

- Add **Ignore** beside members in a room's online-member list.
- Add a compact ignore control beside each chat message's reply button.
- Save ignored members in Firefox extension storage. Ignoring only hides their
  messages in your browser.
- The add-on stores settings locally and does not collect or transmit data.
- Use the extension popup to switch **True Dark Mode**, **Hide Ads**, and
  **Hide Online members** on or off across ChatBlink pages.
- View the number of ignored members and reset the full ignore list from the
  popup.
- Use the supplied icons in `icons/` for the add-on and toolbar logo.

In dark mode, the text in private-message bubbles is also made white.

## Load temporarily in Firefox desktop

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on...**.
3. Choose this folder's `manifest.json`.
4. Open any page under `https://www.chatblink.com/` and use the extension icon
   to access the popup settings.

The extension appears under **Temporary Extensions** in `about:debugging`; it
may not appear in the regular `about:addons` list. Temporary add-ons are removed
when Firefox closes, so load it again after restarting. For permanent
installation, package and submit the extension to Mozilla Add-ons (AMO) for
signing.

## Firefox for Android

The manifest includes Firefox Android metadata, and the extension uses Firefox
WebExtension APIs. Desktop temporary installation does not install the add-on
on a phone. Use a Mozilla-supported Android testing/distribution workflow or
publish it on AMO, then install it in Firefox for Android. Open a ChatBlink room
to use the member ignore controls; the popup options apply across the site.
