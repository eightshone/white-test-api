const mongoose = require("mongoose");
const moment = require("moment");

const whiteTestSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "'name' is required"],
    trim: true
  },
  start_date: {
    type: String, // format: YYYY-MM-DD HH:mm
    required: [true, "'start_date' is required"],
    validate: value => {
      if (moment(value, "YYYY-MM-DD HH:mm", true).isValid()) {
        throw new Error({
          error: "date format isn't valid, use: YYYY-MM-DD HH:mm"
        });
        return false;
      }
      if (moment(value, "YYYY-MM-DD: HH:mm").isBefore(moment())) {
        throw new Error({ error: "date is in the past" });
        return false;
      }
      return true;
    }
  },
  end_date: {
    type: String, // format: YYYY-MM-DD HH:mm
    required: [true, "'end_date' is required"],
    validate: value => {
      if (moment(value, "YYYY-MM-DD HH:mm", true).isValid()) {
        throw new Error({
          error: "date format isn't valid, use: YYYY-MM-DD HH:mm"
        });
        return false;
      }
      if (moment(value, "YYYY-MM-DD: HH:mm").isBefore(moment())) {
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
