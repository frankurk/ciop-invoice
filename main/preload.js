const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  partner: {
    getAll: () => ipcRenderer.invoke("get-partners"),
    getLocationData: (regionId) => ipcRenderer.invoke("get-location-data", regionId),
    getPartnerLevels: () => ipcRenderer.invoke("get-partner-levels"),
    new: (partner) => ipcRenderer.invoke("new-partner", partner),
    delete: (partnerId) => ipcRenderer.invoke("delete-partner", partnerId),
  },
  invoice: {
    getCorrelative: () => ipcRenderer.invoke("get-correlative"),
    setCorrelative: (number) =>
      ipcRenderer.invoke("set-correlative", number),
    generateInvoice: (partnerId, previousBalance = 0) =>
      ipcRenderer.invoke(
        "generate-invoice",
        JSON.stringify({ partnerId, previousBalance })
      ),
  },
});
