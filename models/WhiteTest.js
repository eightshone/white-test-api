const mongoose = require("mongoose");
const moment = require("moment");

const whiteTestSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "'name' is required"],
    trim: true
  },
  date: {
    type: String, // format: YYYY-MM-DD HH:mm
    required: [true, "'date' is required"],
    validate: value => {
      if (moment(value, "YYYY-MM-DD").isBefore(moment())) {
        throw new Error({ error: "date is in the past" });
        return false;
      }
      return true;
    }
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: [true, "'date' is required"]
  }
});

const WhiteTest = new mongoose.model("WhiteTest", whiteTestSchema);

module.exports = WhiteTest;
