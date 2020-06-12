const mongoose = require("mongoose");

const classRoomSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "'name' is required"],
    trim: true
  }
});
