const { app } = require("electron");
const isDev = require("electron-is-dev");
const Datastore = require("nedb-promises");
const dbFactory = (fileName) =>
  Datastore.create({
    filename: `${isDev ? "." : app.getAppPath("userData")}/data/${fileName}`,
    timestampData: true,
    autoload: true,
  });

const db = {
  partner: dbFactory("partners.db"),
  invoiceGeneration: dbFactory("invoices.db"),
};

module.exports = db;
