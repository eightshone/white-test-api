const jwt = require("jsonwebtoken");
const express = require("express");

const auth = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    res.status(401).send({ error: "Token not provided" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_KEY);
    console.log(data);
    if (!data || !data._id) {
      throw new Error();
    }
    req.id = data._id;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Not authorized to access this resource" });
  }
};
module.exports = auth;
