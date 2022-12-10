const { ipcMain } = require("electron");

const invoiceHandler = require("./invoice");
const db = require("./db");
const { getUf, overrideSessionUf } = require("./uf");

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

ipcMain.handle("new-partner-level", async (_event, payload) => {
  if (!payload.name || !payload.price) {
    throw new Error("Campos nombre y precio son obligatorios!");
  }

  const partnerLevel = await db.partnerLevel.insertOne({
    name: payload.name,
    price: payload.price,
  });
  return partnerLevel;
});

ipcMain.handle("delete-partner-level", async (_event, levelId) => {
  const partner = await db.partner.findOne({ levelId });
  if (partner) {
    throw new Error("No se puede eliminar una cuota que está siendo usada por socios!");
  }

  await db.partnerLevel.deleteOne({ _id: levelId });
});

ipcMain.handle("new-partner", async (_event, payload) => {
  if (
    !payload.name ||
    !payload.rut ||
    !payload.address ||
    !payload.communeId ||
    !payload.levelId
  ) {
    throw new Error("Campos nombre, RUT, dirección, comuna y cuota son obligatorios!");
  }

  const partner = await db.partner.insertOne({
    name: payload.name,
    rut: payload.rut,
    address: payload.address,
    communeId: payload.communeId,
    levelId: payload.levelId,
  });
  return partner;
});

ipcMain.handle("delete-partner", async (_event, userId) => {
  await db.partner.deleteOne({ _id: userId });
});

ipcMain.handle("get-correlative", async () => {
  const lastInvoiceNumber = await db.invoiceGeneration.findOne();
  return lastInvoiceNumber?.targetNumber || 1;
});

ipcMain.handle("set-correlative", async (_event, targetNumber) => {
  if (!targetNumber) {
    throw new Error("Falta correlativo!");
  }

  await db.invoiceGeneration.deleteMany();
  await db.invoiceGeneration.insertOne({
    targetNumber: Number.parseInt(targetNumber, 10),
  });
});

ipcMain.handle("generate-invoice", async (_event, payload) => {
  if (!payload.partnerId) {
    throw new Error("Falta socio!");
  }

  const { partnerId, previousBalance = 0 } = payload;
  const invoice = await invoiceHandler.generateInvoice({
    partnerId,
    previousBalance,
  });

  return invoice;
});

ipcMain.handle("get-uf-price", async () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const uf = await getUf(firstDayOfMonth);
  return uf;
});

ipcMain.handle("override-uf-price", async (_event, payload) => {
  if (!payload.date || !payload.price) {
    throw new Error("Falta fecha o precio!");
  }

  overrideSessionUf(payload.date, payload.price);
});
