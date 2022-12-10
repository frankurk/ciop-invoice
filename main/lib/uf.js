const axios = require("axios");

function pad(n) {
  return n.toString().padStart(2, "0");
}

class UFHandler {
  constructor() {
    this.ufValues = {};
    this.overrideSession = null;
  }

  overrideSessionUf = (date, price) => {
    this.overrideSession = { date, price };
  };

  /**
   * 
   * @param {Date} date 
   * @returns {Promise<{date: Date, price: number}>}
   */
  getUf = async (date) => {
    if (this.overrideSession) return this.overrideSession;
    if (this.ufValues[date]) return this.ufValues[date];

    const { data } = await axios.get(`https://mindicador.cl/api/uf/${date.toLocaleDateString('es-CL')}`);
    this.ufValues[date] = { date, price: data.serie[0].valor };
    return this.ufValues[date];
  };

  /**
   * 
   * @param {Date} date 
   * @returns {Promise<{date: Date, price: number}>}
   */
  getUfCMF = async (date) => {
    if (this.overrideSession) return this.overrideSession;
    if (this.ufValues[date]) return this.ufValues[date];

    const key = process.env.CMFCHILE_KEY || "null";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${pad(
      year
    )}/${pad(month)}/dias/${pad(day)}?apikey=${key}&formato=json`;
    const { data } = await axios.get(url);

    const standardizedValue = data.UFs[0].Valor.replace(".", "").replace(
      ",",
      "."
    );
    this.ufValues[date] = { date, price: Number.parseFloat(standardizedValue) };
    return this.ufValues[date];
  };
}

const instance = new UFHandler();
module.exports = instance;
