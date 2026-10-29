(() => {
  const STORAGE_KEY = "chatblinkIgnoredNames";
  const BUTTON_ATTRIBUTE = "data-chatblink-ignore-button";
  const HIDDEN_ATTRIBUTE = "data-chatblink-ignored-message";
  const PREVIOUS_HIDDEN_ATTRIBUTE = "data-chatblink-previous-hidden";
  const ICON_ONLY_ATTRIBUTE = "data-chatblink-icon-only";
  const BLACK_BACKGROUND_KEY = "chatblinkSolidBlackBackgrounds";
  const HIDE_ADS_KEY = "chatblinkHideAds";
  const HIDE_MEMBERS_ONLINE_KEY = "chatblinkHideMembersOnline";
  const ignoredNames = new Set();
  let updateQueued = false;

  const normalize = (value) => value.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase();

  function updateButton(button, name) {
    button.setAttribute("data-chatblink-member-name", name);
    const ignored = ignoredNames.has(normalize(name));
    const iconOnly = button.hasAttribute(ICON_ONLY_ATTRIBUTE);
    const label = ignored ? "Unignore" : "Ignore";
    if (iconOnly) {
      button.querySelector("[data-chatblink-eye-slash]").hidden = !ignored;
    } else if (button.textContent !== label) {
      button.textContent = label;
    }
    const action = ignored ? "Show" : "Hide";
    const ariaLabel = `${iconOnly ? action + " messages from" : label} ${name}`;
    if (button.getAttribute("aria-label") !== ariaLabel) button.setAttribute("aria-label", ariaLabel);
    if (button.getAttribute("aria-pressed") !== String(ignored)) button.setAttribute("aria-pressed", String(ignored));
    const title = `${action} messages from ${name}`;
    if (button.title !== title) button.title = title;
  }

  function createIgnoreButton(name, iconOnly = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute(BUTTON_ATTRIBUTE, "");
    button.className = "btn-ignore rounded-full border border-[#eee] bg-white px-2 py-0.5 text-[11px] text-[#666] hover:bg-slate-100 dark:bg-[#1e1c1c] dark:text-white dark:hover:bg-[#2a2828]";
    button.style.cssText = iconOnly
      ? "display:inline-flex;width:24px;height:23px;align-items:center;justify-content:center;padding:2px;cursor:pointer;"
      : "cursor:pointer;";
    if (iconOnly) {
      button.setAttribute(ICON_ONLY_ATTRIBUTE, "");
      button.setAttribute("aria-label", "Hide messages");
      button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle><path data-chatblink-eye-slash d="M3 3l18 18"></path></svg>';
    }
    updateButton(button, name);

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.disabled = true;

      try {
        const currentName = button.getAttribute("data-chatblink-member-name");
        if (!currentName) return;

        const stored = await chatblinkStorage.get(STORAGE_KEY);
        const names = stored[STORAGE_KEY];
        const nextIgnoredNames = new Set(
          Array.isArray(names)
            ? names.filter((ignoredName) => typeof ignoredName === "string").map(normalize)
            : []
        );
        const key = normalize(currentName);
        if (nextIgnoredNames.has(key)) nextIgnoredNames.delete(key);
        else nextIgnoredNames.add(key);

        await chatblinkStorage.set({ [STORAGE_KEY]: [...nextIgnoredNames] });
        ignoredNames.clear();
        nextIgnoredNames.forEach((ignoredName) => ignoredNames.add(ignoredName));
        updateButton(button, currentName);
        applyIgnoredMessages();
      } catch (error) {
        console.error("ChatBlink Ignore: unable to save ignored members.", error);
      } finally {
        button.disabled = false;
      }
    });

    return button;
  }

  function addIgnoreButton(row) {
    const nameElement = row.querySelector(".text-sm.font-semibold, .font-semibold");
    const name = nameElement?.textContent?.replace(/\s+/g, " ").trim();
    if (!name) return;

    const existingButton = row.querySelector(`[${BUTTON_ATTRIBUTE}]`);
    const button = existingButton || createIgnoreButton(name);
    updateButton(button, name);
    button.style.marginInlineStart = "0";

    const reportButton = row.querySelector(".report-to-admin");
    if (reportButton && reportButton.nextElementSibling !== button) {
      reportButton.insertAdjacentElement("afterend", button);
    } else if (!reportButton && button.parentElement !== row) {
      row.append(button);
    } else if (!reportButton && row.lastElementChild !== button) {
      row.append(button);
    }
  }

  function addMessageIgnoreButton(message) {
    const name = message.dataset.name?.replace(/\s+/g, " ").trim();
    if (!name) return;

    const existingButton = message.querySelector(`[${BUTTON_ATTRIBUTE}]`);
    if (existingButton) {
      updateButton(existingButton, name);
      return;
    }

    const button = createIgnoreButton(name, true);
    const replyButton = message.querySelector(".btn-container .btn-reply");
    if (replyButton) {
      replyButton.insertAdjacentElement("afterend", button);
      return;
    }

    const content = message.querySelector(".msg-smiles")?.parentElement;
    if (!content) return;

    let actions = content.querySelector(".btn-container");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "btn-container relative mt-1 flex justify-end gap-1 overflow-visible";
      content.append(actions);
    }
    actions.append(button);
  }

  function restoreMessage(message) {
    message.hidden = message.getAttribute(PREVIOUS_HIDDEN_ATTRIBUTE) === "true";
    message.removeAttribute(HIDDEN_ATTRIBUTE);
    message.removeAttribute(PREVIOUS_HIDDEN_ATTRIBUTE);
  }

  function applyIgnoredMessages() {
    document.querySelectorAll("li.message[data-name]").forEach((message) => {
      const ignored = ignoredNames.has(normalize(message.dataset.name || ""));
      if (ignored && !message.hasAttribute(HIDDEN_ATTRIBUTE)) {
        message.setAttribute(PREVIOUS_HIDDEN_ATTRIBUTE, String(message.hidden));
        message.setAttribute(HIDDEN_ATTRIBUTE, "");
        message.hidden = true;
      } else if (!ignored && message.hasAttribute(HIDDEN_ATTRIBUTE)) {
        restoreMessage(message);
      }
    });
  }

  function applyDisplaySettings(settings) {
    document.documentElement.toggleAttribute("data-chatblink-solid-black", settings.solidBlack);
    document.documentElement.toggleAttribute("data-chatblink-hide-ads", settings.hideAds);
    document.documentElement.toggleAttribute("data-chatblink-hide-members-online", settings.hideMembersOnline);
    updateMembersOnlineCards();
  }

  function updateMembersOnlineCards() {
    const shouldHide = document.documentElement.hasAttribute("data-chatblink-hide-members-online");
    document.querySelectorAll('a[title="Members Online"]').forEach((link) => {
      const card = link.closest(".rounded-xl");
      if (card) card.toggleAttribute("data-chatblink-members-online-card", shouldHide);
    });
  }

  function updatePage() {
    updateQueued = false;
    updateMembersOnlineCards();
    document.querySelectorAll("#online-members [data-member-row]").forEach(addIgnoreButton);
    document.querySelectorAll("li.message[data-name]").forEach(addMessageIgnoreButton);
    applyIgnoredMessages();
  }

  function queueUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(updatePage);
  }

  async function initialize() {
    const style = document.createElement("style");
    style.textContent = `
      [${HIDDEN_ATTRIBUTE}]{display:none!important}
      html.dark #messages-area-slide li > div {
        color:#fff!important;
      }
      html[data-chatblink-solid-black],
      html[data-chatblink-solid-black] body,
      html[data-chatblink-solid-black] body *,
      html[data-chatblink-solid-black] body *::before,
      html[data-chatblink-solid-black] body *::after {
        background-color:#000!important;
        background-image:none!important;
      }
      html[data-chatblink-hide-ads] .ad-box,
      html[data-chatblink-hide-ads] [data-ad-side],
      html[data-chatblink-hide-ads] #ad-header {
        display:none!important;
      }
      [data-chatblink-members-online-card] {
        display:none!important;
      }
    `;
    document.head.append(style);

    new MutationObserver(queueUpdate).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "style"]
    });
    updatePage();

    try {
      const stored = await chatblinkStorage.get([
        STORAGE_KEY,
        BLACK_BACKGROUND_KEY,
        HIDE_ADS_KEY,
        HIDE_MEMBERS_ONLINE_KEY
      ]);
      const names = stored[STORAGE_KEY];
      if (Array.isArray(names)) {
        names.filter((name) => typeof name === "string").forEach((name) => ignoredNames.add(normalize(name)));
      }
      applyDisplaySettings({
        solidBlack: stored[BLACK_BACKGROUND_KEY] === true,
        hideAds: stored[HIDE_ADS_KEY] === true,
        hideMembersOnline: stored[HIDE_MEMBERS_ONLINE_KEY] === true
      });
    } catch (error) {
      console.error("ChatBlink Ignore: unable to load ignored members.", error);
    }

    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== "local") return;
        if (changes[STORAGE_KEY]) {
          ignoredNames.clear();
          const names = changes[STORAGE_KEY].newValue;
          if (Array.isArray(names)) {
            names.filter((name) => typeof name === "string").forEach((name) => ignoredNames.add(normalize(name)));
          }
          queueUpdate();
        }
        if (changes[BLACK_BACKGROUND_KEY] || changes[HIDE_ADS_KEY] || changes[HIDE_MEMBERS_ONLINE_KEY]) {
          applyDisplaySettings({
            solidBlack: changes[BLACK_BACKGROUND_KEY]?.newValue
              ?? document.documentElement.hasAttribute("data-chatblink-solid-black"),
            hideAds: changes[HIDE_ADS_KEY]?.newValue
              ?? document.documentElement.hasAttribute("data-chatblink-hide-ads"),
            hideMembersOnline: changes[HIDE_MEMBERS_ONLINE_KEY]?.newValue
              ?? document.documentElement.hasAttribute("data-chatblink-hide-members-online")
          });
        }
      });
    } catch (error) {
      console.error("ChatBlink Ignore: unable to listen for storage changes.", error);
    }

    updatePage();
  }

  initialize();
})();
