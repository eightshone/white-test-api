const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/students/signup", async (req, res) => {
  const data = req.body;
  // Check for a body
  if (!data || data === {}) {
    res.status(400).send({ error: "Bad request" });
  }
  // Create a new student
  try {
    // check for existing isEmail
    const emailExists = await User.findOne({ email: data.email });
    if (emailExists) {
      res.status(400).send({ error: "This email exists" });
      return;
    }
    const student = new User({ ...data, role: "student" });
    await student.save();
    res.status(201).send({
      message: "student created",
      data: { user: { name: student.name, email: student.email } }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/admins/signup", async (req, res) => {
  // This should have a protection system to avoid adding admins
  // by intruders
  const data = req.body;
  // Check for a body
  if (!data || data === {}) {
    res.status(400).send({ error: "Bad request" });
  }
  // Create a new admin
  try {
    // check for existing isEmail
    const emailExists = await User.findOne({ email: data.email });
    if (emailExists) {
      res.status(400).send({ error: "This email exists" });
      return;
    }
    const admin = new User({ ...data, role: "admin" });
    await admin.save();
    res.status(201).send({
      message: "admin created",
      data: { user: { name: admin.name, email: admin.email } }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/supervisors", auth, async (req, res) => {
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
  }
  const data = req.body;
  // Check for a body
  if (!data || data === {}) {
    res.status(400).send({ error: "Bad request" });
  }
  // Create a new supervisor
  try {
    // check for existing isEmail
    const emailExists = await User.findOne({ email: data.email });
    if (emailExists) {
      res.status(400).send({ error: "This email exists" });
      return;
    }
    const supervisor = new User({ ...data, role: "supervisor" });
    await supervisor.save();
    res.status(201).send({
      message: "supervisor created",
      data: { user: { name: supervisor.name, email: supervisor.email } }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  //Login a registered user
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const token = await user.generateAuthToken();
    res.send({
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          token: user.token
        }
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/users/me", auth, async (req, res) => {
  // View logged in user profile
  const user = await User.findOne({ _id: req.id });
  if (!user) {
    res.status(400).send({ error: "Bad request" });
  }
  res.send({
    data: {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        token: user.token
      }
    }
  });
});

router.get("/supervisors", auth, async (req, res) => {
  // List supervisors
  const users = await User.find({ role: "supervisor" });
  const supervisors = users.map(el => {
    return { name: el.name, email: el.email, role: el.role };
  });
  res.send({
    data: {
      supervisors
    }
  });
});

router.get("/admins", auth, async (req, res) => {
  // List admins
  const users = await User.find({ role: "admin" });
  const admins = users.map(el => {
    return { name: el.name, email: el.email, role: el.role };
  });
  res.send({
    data: {
      admins
    }
  });
});

router.get("/students", auth, async (req, res) => {
  // List students
  const users = await User.find({ role: "student" });
  const students = users.map(el => {
    return { name: el.name, email: el.email, role: el.role };
  });
  res.send({
    data: {
      students
    }
  });
});

router.post("/users/me/logout", auth, async (req, res) => {
  // Log user out of the application
  try {
    const user = await User.findOne({ _id: req.id });
    if (!user) {
      res.status(400).send({ error: "Bad request" });
    }
    user.token = "";
    await user.save();
    res.send({ message: "logged out" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
