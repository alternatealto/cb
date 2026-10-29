(() => {
  const extensionApi = globalThis.chrome;

  function callStorage(method, value) {
    return new Promise((resolve, reject) => {
      method.call(extensionApi.storage.local, value, (result) => {
        const error = extensionApi.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  globalThis.chatblinkStorage = {
    get(keys) {
      return callStorage(extensionApi.storage.local.get, keys);
    },
    set(items) {
      return callStorage(extensionApi.storage.local.set, items);
    }
  };
})();
