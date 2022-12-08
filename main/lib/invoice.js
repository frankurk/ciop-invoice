const fs = require("fs/promises");
const { compile } = require("handlebars");
const db = require("./db");
const browserRenderer = require("./browser");
const { getUf } = require("./uf");

const clpCLLocale = Intl.NumberFormat("es-CL");

function pad(n) {
  return n.toString().padStart(2, "0");
}

function upperCaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9 ]/gi, '');
}

class InvoiceHandler {
  async generateInvoice({ partnerId, previousBalance = 0 }) {
    const partner = await db.partner.findOne({ _id: partnerId });
    console.log(partner);
    const partnerLevel = await db.partnerLevel.findOne({ _id: partner.levelId });
    const commune = await db.commune.findOne({ _id: partner.communeId });
    const region = await db.region.findOne({ _id: commune.regionId });

    const lastInvoiceGeneration = await db.invoiceGeneration.find();

    const correlative = lastInvoiceGeneration.length
      ? lastInvoiceGeneration[0].targetNumber
      : 1;
    const address = `${partner.address}, ${commune.name}`;

    const DATE = new Date();
    const DAY = DATE.getDate();
    const MONTH = DATE.getMonth() + 1;
    const YEAR = DATE.getFullYear();
    const FIRST_DAY_OF_MONTH = `01-${pad(MONTH)}-${YEAR}`;
    const FULL_DATE = `${pad(DAY)}-${pad(MONTH)}-${YEAR}`;
    const ufValue = await getUf(FULL_DATE);
    const currentMonthCostClp = Math.round(
      partnerLevel.price * ufValue
    );
    const totalToPay = Math.round(currentMonthCostClp + previousBalance);

    const html = await fs.readFile(`${__dirname}/../templates/v1/index.html`, "utf-8");
    const template = compile(html);

    const payload = {
      partner: {
        name: partner.name.toUpperCase(),
        address,
        region: region.name,
        rut: partner.rut,
      },
      invoice: {
        number: correlative,
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
            amountInUf: clpCLLocale.format(partnerLevel.price),
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
      targetNumber: correlative + 1,
    });

    return {
      buffer: pdf,
      filename: `${correlative} - ${sanitizeFilename(partner.name)}.pdf`,
      number: correlative,
    };
  }
}

const invoiceHandler = new InvoiceHandler();
module.exports = invoiceHandler;
