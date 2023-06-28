const express = require("express");
const Joi = require("joi");

const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../service/schemas/user");
require("dotenv").config();
const secret = process.env.JWT_KEY;

const schema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  //Password regex - minimum 3 and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character
  password: Joi.string().pattern(
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{3,10}$"
    )
  ),
});

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await schema.validateAsync({ email: email, password: password });
  } catch (err) {
    return res.status(401).json({
      status: "error",
      code: 400,
      message: "Bad request",
      data: { err },
    });
  }

  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong ",
      data: "Unauthorized",
    });
  }

  const payload = {
    id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  user.token = token;
  user.save();

  return res.json({
    status: "success",
    code: 200,
    data: {
      token,
      user,
    },
  });
});

router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await schema.validateAsync({ email, password });
  } catch (err) {
    return res.status(401).json({
      status: "error",
      code: 400,
      message: "Bad request",
      data: { err },
    });
  }

  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email in use",
      data: "Conflict",
    });
  }
  try {
    const newUser = new User({ email: email });
    newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        message: "Registration successful",
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", auth, async (req, res, next) => {
  const user = req.user;
  if (user) {
    user.token = null;
    user.save();
    return res.status(204).json({
      status: "success",
      code: 204,
      message: "No Content",
      data: "No Content",
    });
  } else {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
      data: "Unauthorized",
    });
  }
});

router.get("/current", auth, async (req, res, next) => {
  const user = req.user;
  if (user) {
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "current user",
      data: { email: user.email, subscription: user.subscription },
    });
  } else {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
      data: "Not authorized",
    });
  }
});

module.exports = {
  router,
  auth,
};
