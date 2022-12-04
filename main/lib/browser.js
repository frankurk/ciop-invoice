const puppeteer = require("puppeteer")

class BrowserRenderer {
  async init() {
    this.browser = await puppeteer.launch()
  }

  async close() {
    await this.browser?.close()
  }

  async renderPdf(data) {
    if (!this.browser || !this.browser.isConnected()) await this.init()

    try {
      const context = await this.browser.newContext()
      const page = await context.newPage()
      await page.setContent(data.body, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(1000) // Needs time to fully render... 'domcontentloaded' doesn't seems to help with it

      await page.emulateMedia({ media: data.media || "print" })

      const pdf = await page.pdf({
        headerTemplate: data.header ? data.header : "<span></span>",
        footerTemplate: data.footer ? data.footer : "<span></span>",
        format:
          data.format == null && data.width == null && data.height == null ? "a4" : data.format,
        landscape: data.landscape || false,
        width: data.width || 0,
        height: data.height || 0,
        margin: {
          left: data.margin?.left || 0,
          right: data.margin?.right || 0,
          top: data.margin?.top || 0,
          bottom: data.margin?.bottom || 0
        },
        scale: data.scale || 1,
        printBackground: data.printBackground || false,
        pageRanges: data.pageRanges || "",
        preferCSSPageSize: data.preferCSSPageSize || false,
        displayHeaderFooter: true
      })

      await page.close()
      await context.close()

      return pdf
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      await this.close()
    }
  }
}

const browserRenderer = new BrowserRenderer()
module.exports = browserRenderer
