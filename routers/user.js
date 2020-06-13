const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/students/signup", async (req, res) => {
  const data = req.body;
  // Check for a body
  if (!data || data === {}) {
    res.status(400).send({ error: "Bad request" });
    return;
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
    return;
  }
  // Create a new admin
  try {
    const adminExists = User.find({ role: "admin" });
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
  // Checks role
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
    return;
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
  // Checks role
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }
  // List supervisors
  const users = await User.find({ role: "supervisor" });
  const supervisors = users.map(el => {
    return { id: el._id, name: el.name, email: el.email, role: el.role };
  });
  res.send({
    data: {
      supervisors
    }
  });
});

router.get("/admins", auth, async (req, res) => {
  // Checks role
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }
  // List admins
  const users = await User.find({ role: "admin" });
  const admins = users.map(el => {
    return { id: el._id, name: el.name, email: el.email, role: el.role };
  });
  res.send({
    data: {
      admins
    }
  });
});

router.get("/students", auth, async (req, res) => {
  // Checks role
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }
  // List students
  const users = await User.find({ role: "student" });
  const students = users.map(el => {
    return { id: el._id, name: el.name, email: el.email, role: el.role };
  });
  res.send({
    data: {
      students
    }
  });
});

router.get("/users/delete/:id", auth, async (req, res) => {
  // Checks role
  if (!req.role || req.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }
  // checks if self deleting
  if (req.id === req.params.id) {
    res.status(400).send({ error: "Bad request, you can delete yourslef" });
    return;
  }
  // delete student
  const user = await User.findOneAndDelete({ _id: req.params.id });
  res.send({
    message: "user deleted",
    data: {
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

router.post("/users/me/logout", auth, async (req, res) => {
  // Log user out of the application
  try {
    const user = await User.findOne({ _id: req.id });
    if (!user) {
      res.status(400).send({ error: "Bad request" });
      return;
    }
    user.token = "";
    await user.save();
    res.send({ message: "logged out" });
  } catch (error) {
    res.status(500).send(error);
  }
});

// edit a user
router.post("/users/:id", auth, async (req, res) => {
  // check if something was changed
  let changed = false;
  // Checks role
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
  // update user
  try {
    // check for user
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      res.status(400).send({ error: "User doesn't exist" });
      return;
    }

    // updates email if passed
    if (data.email && data.email !== user.email) {
      // check if the email exists
      const emailExists = await User.findOne({ email: data.email });
      if (emailExists) {
        res.status(400).send({ error: "This email exists" });
        return;
      }
      user.email = data.email;
      changed = true;
    }

    // updates name if passed
    if (data.name && data.name !== user.name) {
      user.name = data.name;
      changed = true;
    }
    if (changed) {
      await user.save();
      res.status(200).send({
        message: "user updated",
        data: { user: { name: user.name, email: user.email } }
      });
    } else {
      res.status(200).send({
        message: "nothing changed",
        data: { user: { name: user.name, email: user.email } }
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
