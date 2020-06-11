const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("../models/User.js");

const auth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const data = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findOne({ _id: data._id }).exec();
    console.log("user:", await User.findOne({ _id: data._id }));
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Not authorized to access this resource" });
    console.log(error);
  }
};
module.exports = auth;
