const axios = require("axios");

class UFHandler {
  constructor() {
    this.ufValues = {};
  }

  getUf = async (date) => {
    if (this.ufValues[date]) return this.ufValues[date];

    const { data } = await axios.get(`https://mindicador.cl/api/uf/${date}`);
    this.ufValues[date] = data.serie[0].valor;
    return this.ufValues[date];
  };

  getUfCMF = async (year, month, day) => {
    if (this.ufValues[`${year}-${month}-${day}`]) return this.ufValues[`${year}-${month}-${day}`];

    const key = process.env.CMFCHILE_KEY || "null";
    const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${pad(
      year
    )}/${pad(month)}/dias/${pad(day)}?apikey=${key}&formato=json`;
    const { data } = await axios.get(url);

    const standardizedValue = data.UFs[0].Valor.replace(".", "").replace(
      ",",
      "."
    );
    this.ufValues[`${year}-${month}-${day}`] = Number.parseFloat(standardizedValue);
    return this.ufValues[`${year}-${month}-${day}`];
  };
}

const instance = new UFHandler();
module.exports = instance;
