const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
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
