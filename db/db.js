const mongoose = require("mongoose");

module.exports = async function connectionToMongo() {
  console.log("hani lenna");
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true
    });
    console.log("connection established");
  } catch (err) {
    console.log("error:", err);
  }
};
