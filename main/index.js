// Native
const { join } = require("path");

// Packages
const { BrowserWindow, app, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");

const invoiceHandler = require("./lib/invoice");
const db = require("./db");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  const url = isDev
    ? "http://localhost:8000"
    : new URL("renderer/out/index.html", `file://${__dirname}`).toString();

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", async (event, message) => {
  event.sender.send("message", message);
});

ipcMain.handle("get-correlative", async () => {
  const lastInvoiceNumber = await db.invoiceGeneration.findOne();
  return lastInvoiceNumber?.targetNumber || 1;
});

ipcMain.handle("set-correlative", async (_event, message) => {
  await db.invoiceGeneration.deleteMany();
  await db.invoiceGeneration.insertOne({
    targetNumber: Number.parseInt(message, 10),
  });
});

ipcMain.handle("generate-invoice", async (_event, message) => {
  const { partnerId, previousBalance = 0 } = JSON.parse(message);
  const invoice = await invoiceHandler.generateInvoice({
    partnerId,
    previousBalance,
  });

  return {
    body: Buffer.from(invoice.buffer).toString("base64"),
    mime: "application/pdf",
  };
});
