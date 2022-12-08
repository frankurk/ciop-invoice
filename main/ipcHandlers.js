const { ipcMain } = require("electron");

const invoiceHandler = require("./lib/invoice");
const db = require("./db");

ipcMain.handle("get-partners", async () => {
  const partners = await db.partner.find().sort({ createdAt: 1 });
  for (const partner of partners) {
    const commune = await db.commune.findOne({ _id: partner.communeId });
    const region = await db.region.findOne({ _id: commune.regionId });
    const partnerLevel = await db.partnerLevel.findOne({
      _id: partner.levelId,
    });
    partner.commune = commune;
    partner.commune.region = region;
    partner.partnerLevel = partnerLevel;
  }
  return partners;
});

ipcMain.handle("get-location-data", async (_event, message) => {
  const regions = await db.region.find().sort({ index: 1 });
  let communes = [];
  if (!!message) {
    communes = await db.commune.find({ regionId: message }).sort({ name: 1 });
  }
  return { regions, communes };
});

ipcMain.handle("get-partner-levels", async () => {
  const parnerLevels = await db.partnerLevel.find().sort({ name: 1 });
  return parnerLevels;
});

ipcMain.handle("new-partner", async (_event, payload) => {
  const partner = await db.partner.insertOne({
    name: payload.name,
    rut: payload.rut,
    address: payload.address,
    communeId: payload.communeId,
    levelId: payload.levelId,
  });
  return partner;
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

  return invoice;
});
