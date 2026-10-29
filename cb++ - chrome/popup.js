(() => {
  const STORAGE_KEY = "chatblinkIgnoredNames";
  const BLACK_BACKGROUND_KEY = "chatblinkSolidBlackBackgrounds";
  const HIDE_ADS_KEY = "chatblinkHideAds";
  const HIDE_MEMBERS_ONLINE_KEY = "chatblinkHideMembersOnline";
  const summary = document.querySelector("#summary");
  const error = document.querySelector("#error");
  const resetButton = document.querySelector("#reset");
  const solidBlackToggle = document.querySelector("#solid-black");
  const hideAdsToggle = document.querySelector("#hide-ads");
  const hideMembersOnlineToggle = document.querySelector("#hide-members-online");

  const settings = [
    { key: BLACK_BACKGROUND_KEY, toggle: solidBlackToggle },
    { key: HIDE_ADS_KEY, toggle: hideAdsToggle },
    { key: HIDE_MEMBERS_ONLINE_KEY, toggle: hideMembersOnlineToggle }
  ];

  function renderSetting(setting, enabled) {
    setting.toggle.checked = enabled;
    setting.toggle.disabled = false;
  }

  function render(names) {
    const count = names.length;
    summary.textContent = `${count} ${count === 1 ? "member" : "members"} ignored`;
    resetButton.disabled = count === 0;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }

  async function load() {
    try {
      const stored = await chatblinkStorage.get([
        STORAGE_KEY,
        BLACK_BACKGROUND_KEY,
        HIDE_ADS_KEY,
        HIDE_MEMBERS_ONLINE_KEY
      ]);
      const names = stored[STORAGE_KEY];
      render(Array.isArray(names) ? names.filter((name) => typeof name === "string") : []);
      for (const setting of settings) {
        renderSetting(setting, stored[setting.key] === true);
      }
    } catch (loadError) {
      summary.textContent = "Could not load extension settings.";
      showError(loadError.message || String(loadError));
    }
  }

  resetButton.addEventListener("click", async () => {
    resetButton.disabled = true;
    error.hidden = true;
    try {
      await chatblinkStorage.set({ [STORAGE_KEY]: [] });
      render([]);
    } catch (resetError) {
      showError(resetError.message || String(resetError));
      resetButton.disabled = false;
    }
  });

  for (const setting of settings) {
    setting.toggle.addEventListener("change", async () => {
      setting.toggle.disabled = true;
      error.hidden = true;
      const enabled = setting.toggle.checked;
      try {
        await chatblinkStorage.set({ [setting.key]: enabled });
        renderSetting(setting, enabled);
      } catch (settingError) {
        setting.toggle.checked = !enabled;
        showError(settingError.message || String(settingError));
      } finally {
        setting.toggle.disabled = false;
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes[STORAGE_KEY]) {
      const names = changes[STORAGE_KEY].newValue;
      render(Array.isArray(names) ? names.filter((name) => typeof name === "string") : []);
    }
    for (const setting of settings) {
      if (changes[setting.key]) renderSetting(setting, changes[setting.key].newValue === true);
    }
  });

  load();
})();
