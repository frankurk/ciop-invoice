const fs = require("fs/promises");
const { compile } = require("handlebars");
const db = require("./db");
const browserRenderer = require("./browser");
const { getUf } = require("./uf");

const clLocale = Intl.NumberFormat("es-CL");

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

    const currentDate = new Date();
    const firstDayOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const ufValue = await getUf(firstDayOfMonthDate);
    const currentMonthCostClp = Math.round(
      partnerLevel.price * ufValue.price
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
        date: currentDate.toLocaleDateString('es-CL'),
        firstDayOfMonth: ufValue.date.toLocaleDateString('es-CL'),
        details: [
          {
            mainText: "Cuota",
            description: `${upperCaseFirstLetter(
              currentDate.toLocaleString("es-CL", {
                month: "long",
              })
            )} ${currentDate.getFullYear()}`,
            amountInUf: clLocale.format(partnerLevel.price),
            amountInClp: clLocale.format(currentMonthCostClp),
          },
        ],
        subtotal: clLocale.format(currentMonthCostClp),
        previousBalance: clLocale.format(previousBalance),
        totalToPay: clLocale.format(totalToPay),
        writtenMonth: currentDate.toLocaleString("es-CL", {
          month: "long",
        }),
        year: currentDate.getFullYear(),
        ufValue: clLocale.format(ufValue.price),
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
