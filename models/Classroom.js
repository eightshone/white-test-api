const mongoose = require("mongoose");

const classroomSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "'name' is required"],
    trim: true
  }
});

const Classroom = new mongoose.model("Classroom", classroomSchema);

module.exports = Classroom;
