const express = require("express");
const Classroom = require("../models/Classroom");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/classrooms", auth, async (req, res) => {
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }
  try {
    // list all classrooms
    const classrooms = await Classroom.find();
    res.status(200).send({ data: { classrooms } });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/classrooms", auth, async (req, res) => {
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

  try {
    // create a new classroom
    const classroom = new Classroom(data);
    await classroom.save();
    res.status(200).send({ data: { classroom } });
  } catch (error) {
    res.status(400).send(error);
  }
});

// update classroom
router.post("/classrooms/:id", auth, async (req, res) => {
  // check if something was changed
  let changed = false;

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

  try {
    const classroom = await Classroom.findOne({ _id: req.params.id });
    if (!classroom) {
      res.status(400).send({ error: "classroom doesn't exist" });
      return;
    }
    if (data.name && data.name !== classroom.name) {
      classroom.name = data.name;
      changed = true;
    }
    if (changed) {
      await classroom.save();
      res
        .status(200)
        .send({ message: "classroom updated", data: { classroom } });
    } else {
      res.status(200).send({ message: "nothing changed", data: { classroom } });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/classrooms/:id", auth, async (req, res) => {
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }
  try {
    // get ided classroom
    const classroom = await Classroom.findOne({ _id: req.params.id });
    if (!classroom) {
      res.status(404).send({ error: "data not found" });
      return;
    }
    res.status(200).send({ data: { classroom } });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/classrooms/delete/:id", auth, async (req, res) => {
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  try {
    // get ided classroom
    const classroom = await Classroom.findOneAndDelete({ _id: req.params.id });
    if (!classroom) {
      res.status(404).send({ error: "data not found" });
      return;
    }
    res.status(200).send({ message: "user deleted", data: { classroom } });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
