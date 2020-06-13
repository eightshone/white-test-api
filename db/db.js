const mongoose = require("mongoose");

module.exports = async function connectionToMongo() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true
    });
    console.log("Connection to database established \u2713");
  } catch (err) {
    console.log("error:", err);
  }
};
