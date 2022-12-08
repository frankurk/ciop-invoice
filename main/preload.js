const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  partner: {
    getPartners: () => ipcRenderer.invoke("get-partners"),
    getLocationData: (regionId) => ipcRenderer.invoke("get-location-data", regionId),
    getLevels: () => ipcRenderer.invoke("get-partner-levels"),
    newPartner: (partner) => ipcRenderer.invoke("new-partner", partner),
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
