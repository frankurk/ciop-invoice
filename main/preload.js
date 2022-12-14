const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  general: {
    getLocationData: (regionId) =>
      ipcRenderer.invoke("get-location-data", regionId),
    getUfPrice: () => ipcRenderer.invoke("get-uf-price"),
    overrideUfPrice: (date, price) =>
      ipcRenderer.invoke("override-uf-price", { date, price }),
  },
  partner: {
    getAll: () => ipcRenderer.invoke("get-partners"),
    new: (partner) => ipcRenderer.invoke("new-partner", partner),
    update: (partnerId, payload) =>
      ipcRenderer.invoke("update-partner", { partnerId, payload }),
    delete: (partnerId) => ipcRenderer.invoke("delete-partner", partnerId),
  },
  partnerLevel: {
    getAll: () => ipcRenderer.invoke("get-partner-levels"),
    new: (level) => ipcRenderer.invoke("new-partner-level", level),
    update: (levelId, payload) =>
      ipcRenderer.invoke("update-partner-level", { levelId, payload }),
    delete: (levelId) => ipcRenderer.invoke("delete-partner-level", levelId),
  },
  invoice: {
    getCorrelative: () => ipcRenderer.invoke("get-correlative"),
    setCorrelative: (number) => ipcRenderer.invoke("set-correlative", number),
    generateInvoice: (partnerId, previousBalance = 0) =>
      ipcRenderer.invoke("generate-invoice", { partnerId, previousBalance }),
  },
});
