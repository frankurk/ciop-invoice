const fs = require("fs/promises");
const axios = require("axios");
const { compile } = require("handlebars");
const db = require("../db");
const browserRenderer = require("./browser");

const clpCLLocale = Intl.NumberFormat("es-CL");

function pad(n) {
  return n.toString().padStart(2, "0");
}

function upperCaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const getUf = async (date) => {
  const { data } = await axios.get(`https://mindicador.cl/api/uf/${date}`);
  return data.serie[0].valor;
};

const getUfCMF = async (year, month, day) => {
  const key = process.env.CMFCHILE_KEY || "null";
  const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${pad(
    year
  )}/${pad(month)}/dias/${pad(day)}?apikey=${key}&formato=json`;
  const { data } = await axios.get(url);

  const standardizedValue = data.UFs[0].Valor.replace(".", "").replace(
    ",",
    "."
  );
  return Number.parseFloat(standardizedValue);
};

class InvoiceHandler {
  async generateInvoice({ partnerId, previousBalance = 0 }) {
    const partner = await db.partner.findOne({
      _id: partnerId,
    });
    const lastInvoiceGeneration = await db.invoiceGeneration.find();

    const nextNumber = lastInvoiceGeneration.length
      ? lastInvoiceGeneration[0].targetNumber + 1
      : 1;
    const address = `${partner.address}, ${partner.commune.name}`;

    const DATE = new Date();
    const DAY = DATE.getDate();
    const MONTH = DATE.getMonth() + 1;
    const YEAR = DATE.getFullYear();
    const FIRST_DAY_OF_MONTH = `01-${pad(MONTH)}-${YEAR}`;
    const FULL_DATE = `${pad(DAY)}-${pad(MONTH)}-${YEAR}`;
    const ufValue = await getUf(YEAR, MONTH, 1);
    const currentMonthCostClp = Math.round(
      partner.subscription.price * ufValue
    );
    const totalToPay = Math.round(currentMonthCostClp + previousBalance);

    const html = await fs.readFile("./templates/v1/index.html", 'utf-8');
    const template = compile(html);

    const payload = {
      partner: {
        name: partner.name.toUpperCase(),
        address,
        region: partner.commune.region.name,
        rut: partner.rut,
      },
      invoice: {
        number: nextNumber,
        date: FULL_DATE,
        firstDayOfMonth: FIRST_DAY_OF_MONTH,
        details: [
          {
            mainText: "Cuota",
            description: `${upperCaseFirstLetter(
              DATE.toLocaleString("es-CL", {
                month: "long",
              })
            )} ${YEAR}`,
            amountInUf: clpCLLocale.format(partner.subscription.price),
            amountInClp: clpCLLocale.format(currentMonthCostClp),
          },
        ],
        subtotal: clpCLLocale.format(currentMonthCostClp),
        previousBalance: clpCLLocale.format(previousBalance),
        totalToPay: clpCLLocale.format(totalToPay),
        writtenMonth: DATE.toLocaleString("es-CL", {
          month: "long",
        }),
        year: YEAR,
        ufValue: clpCLLocale.format(ufValue),
      },
    };

    const pdf = await browserRenderer.renderPdf({
      body: template(payload),
      margin: { top: 40, left: 40, right: 40 },
    });

    // store the current invoice number before returning
    await db.invoiceGeneration.removeMany();
    await db.invoiceGeneration.insert({
      targetNumber: nextNumber,
    });

    return {
      buffer: pdf,
      number: nextNumber,
    };
  }
}

const invoiceHandler = new InvoiceHandler();
module.exports = invoiceHandler;
