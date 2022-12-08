// Native
const { join } = require("path");

// Packages
const { BrowserWindow, app } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");

const init = require("./init");
require("./lib/ipcHandlers");
const browser = require("./lib/browser");

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

  browser.init();
});

// Quit the app once all windows are closed
app.on("window-all-closed", () => {
  browser.close();
  app.quit();
});

init();
