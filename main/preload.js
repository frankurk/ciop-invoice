const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  partner: {
    getLocationData: (regionId) =>
      ipcRenderer.invoke("get-location-data", regionId),
    getAll: () => ipcRenderer.invoke("get-partners"),
    new: (partner) => ipcRenderer.invoke("new-partner", partner),
    delete: (partnerId) => ipcRenderer.invoke("delete-partner", partnerId),
  },
  partnerLevel: {
    getAll: () => ipcRenderer.invoke("get-partner-levels"),
    new: (level) => ipcRenderer.invoke("new-partner-level", level),
    delete: (levelId) => ipcRenderer.invoke("delete-partner-level", levelId),
  },
  invoice: {
    getCorrelative: () => ipcRenderer.invoke("get-correlative"),
    setCorrelative: (number) => ipcRenderer.invoke("set-correlative", number),
    generateInvoice: (partnerId, previousBalance = 0) =>
      ipcRenderer.invoke("generate-invoice", { partnerId, previousBalance }),
  },
});
