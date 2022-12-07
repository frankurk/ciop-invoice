const db = require("./db");

const init = async () => {
  const partnerLevels = await db.partnerLevel.find();

  if (!partnerLevels.length) {
    console.log("No partner levels found, creating default ones...");
    await db.partnerLevel.insertMany([
      { name: "A", price: 75.2 },
      { name: "B", price: 37.6 },
      { name: "C", price: 18.8 },
      { name: "D", price: 9.4 },
      { name: "E", price: 1.9 },
      { name: "F", price: 1.4 },
    ]);
  }
};

module.exports = init;
