// Native
const { join } = require('path')
const { format } = require('url')

// Packages
const { BrowserWindow, app, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')

const invoiceHandler = require('./lib/invoice')

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  })

  const url = isDev
    ? 'http://localhost:8000'
    : new URL('renderer/out/index.html', `file://${__dirname}`).toString()

  mainWindow.loadURL(url)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

console.log(process.env.NODE_ENV);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', async (event, message) => {
  const invoice = await invoiceHandler.generateInvoice({ partnerId: '123', previousBalance: 0 });

  const data = {
    body: Buffer.from(invoice.buffer).toString('base64'),
    mime: 'application/pdf',
  }
  event.sender.send('message', JSON.stringify(data))
})
