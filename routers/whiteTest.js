const express = require("express");
const WhiteTest = require("../models/WhiteTest");
const auth = require("../middleware/auth");
const moment = require("moment");
const Classroom = require("../models/Classroom");
const User = require("../models/User");

const router = express.Router();

router.get("/whitetests", auth, async (req, res) => {
  try {
    // list all white tests
    const whiteTests = await WhiteTest.find()
      .populate("classroom", "name")
      .populate("participants", "name")
      .populate("supervisor", "name");
    res.status(200).send({ data: { whiteTests } });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/whitetests", auth, async (req, res) => {
  // check for admin role
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  const data = req.body;
  // Check for a body
  if (!data || data === {}) {
    res.status(400).send({ error: "Bad request" });
    return;
  }

  // check dates
  if (data.start_date && data.end_date) {
    if (!moment(data.start_date, "YYYY-MM-DD HH:mm", true).isValid()) {
      res
        .status(400)
        .send({ error: "Bad request: start_date has a wrong format" });
      return;
    }
    if (!moment(data.end_date, "YYYY-MM-DD HH:mm", true).isValid()) {
      res
        .status(400)
        .send({ error: "Bad request: end_date has a wrong format" });
      return;
    }
    if (
      moment(data.end_date, "YYYY-MM-DD HH:mm").isBefore(
        moment(data.start_date, "YYYY-MM-DD HH:mm")
      )
    ) {
      res.status(400).send({
        error: "Bad request: end_date is before start_date has a wrong format"
      });
      return;
    }
  } else {
    res.status(400).send({ error: "Bad request" });
    return;
  }

  try {
    // check room existance
    const classroom = await Classroom.findOne({ _id: data.classroom });
    if (!classroom) {
      res.status(400).send({ error: "classroom dosn't exist" });
      return;
    }

    // check if room is reserved at that time
    const testsAtRoom = await WhiteTest.find({ classroom: data.classroom });
    const reqStartDate = moment(data.start_date, "YYYY-MM-DD HH:mm");
    const reqEndDate = moment(data.end_date, "YYYY-MM-DD HH:mm");

    if (testsAtRoom && testsAtRoom.length != 0) {
      const testAtThatDuration = testsAtRoom.filter(el => {
        const elStartDate = moment(el.start_date, "YYYY-MM-DD HH:mm");
        const elEndDate = moment(el.end_date, "YYYY-MM-DD HH:mm");

        // it's the same duration
        if (
          el.start_date === data.start_date &&
          el.end_date === data.end_date
        ) {
          return true;
        }

        // requested duration is within occupation time
        if (
          elStartDate.isBefore(reqStartDate) &&
          reqEndDate.isBefore(elEndDate)
        ) {
          return true;
        }

        // requested duration ends within occupation time
        if (
          elStartDate.isBefore(reqEndDate) &&
          reqEndDate.isBefore(elEndDate)
        ) {
          return true;
        }

        // requested duration starts within occupation time
        if (
          elStartDate.isBefore(reqStartDate) &&
          reqStartDate.isBefore(elEndDate)
        ) {
          return true;
        }

        // requested duration contains occupation time
        if (
          reqStartDate.isBefore(elStartDate) &&
          elEndDate.isBefore(reqEndDate)
        ) {
          return true;
        }

        // default
        return false;
      });
      console.log(testAtThatDuration);
      if (testAtThatDuration.length !== 0) {
        res.status(400).send({ error: "room occupied" });
        return;
      }
    }

    // check supervisor existance
    const supervisor = await User.findOne({
      _id: data.supervisor,
      role: "supervisor"
    });
    if (!supervisor) {
      res.status(400).send({ error: "supervisor dosn't exist" });
      return;
    }

    // create a new wite test
    const whiteTest = new WhiteTest({ ...data, participants: [] });
    await whiteTest.save();
    res.status(200).send({ data: { whiteTest } });
  } catch (error) {
    res.status(400).send(error);
  }
});

// join white test
router.get("/whitetests/:id", auth, async (req, res) => {
  // check for admin role
  if (!req.role || req.role !== "student") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  try {
    // get test
    const whiteTest = await WhiteTest.findOne({ _id: req.params.id });
    whiteTest.participants.push(req.id);
    whiteTest.save();
    res.status(200).send({ message: "you are registered to this test" });
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete white test
router.get("/whitetests/:id/delete", auth, async (req, res) => {
  // check for admin role
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  try {
    // get test
    const whiteTest = await WhiteTest.findOneAndDelete({ _id: req.params.id });
    res.status(200).send({ message: "white test deleted", data: whiteTest });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
