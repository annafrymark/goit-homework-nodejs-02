const express = require("express");
const path = require("path");
const multer = require("multer");
const Joi = require("joi");
const Jimp = require("jimp");

const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../service/schemas/user");

require("dotenv").config();
const secret = process.env.JWT_KEY;
const {
  createVerificationToken,
  sendVerificationEmail,
} = require("./sendEmail");

const schema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  //Password regex - minimum 3 and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character
  password: Joi.string().pattern(
    new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{4,16}$")
  ),
  verificationToken: [Joi.string(), Joi.number()],
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

const tmpDir = path.join(process.cwd(), "tmp");
const avatarDir = path.join(process.cwd(), "public", "avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    getFilenameWithSuffix(file.originalname, cb);
  },
});

function getFilenameWithSuffix(originalname, callback) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  console.log(uniqueSuffix);
  callback(null, uniqueSuffix + "-" + originalname);
}

const upload = multer({
  storage: storage,
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await schema.validateAsync({ email: email, password: password });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Bad request",
      data: { err },
    });
  }

  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong ",
      data: "Unauthorized",
    });
  }

  if (!user.verify)
    return res.status(400).json({
      status: "Bad Request",
      code: 400,
      message: "Email is not verified",
    });

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
    await schema.validateAsync({ email: email, password: password });
  } catch (err) {
    return res.status(400).json({
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
    const verificationToken = createVerificationToken();
    const newUser = new User({
      email: email,
      verificationToken: verificationToken,
    });
    newUser.setPassword(password);
    await newUser.save();
    console.log(newUser.verificationToken);
    await sendVerificationEmail(email, newUser.verificationToken);

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

router.patch(
  "/avatars",
  [upload.single("avatar"), auth],
  async (req, res, next) => {
    const user = req.user;
    // console.log(req.file);

    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Not authorized",
        data: "Not authorized",
      });
    } else {
      try {
        // upload.single("picture");
        //console.log(req);
        if (!req.file) {
          return res.status(400).json({
            status: "error",
            code: 400,
            message: "File not provided",
            data: "File not provided",
          });
        } else {
          const ResizedAvatar = await Jimp.read(req.file.path);
          await ResizedAvatar.resize(250, 250).writeAsync(req.file.path);
          user.avatarURL = `/avatars/${req.file.filename}`;
          await user.save();
          res.status(200).json({
            status: "success",
            code: 200,
            message: "success",
            data: { avatarURL: user.avatarURL },
          });
          await ResizedAvatar.writeAsync(
            path.join(avatarDir, req.file.filename)
          );
        }
      } catch (error) {
        console.error(error);
        next(error);
      }
    }
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.verificationToken,
    });
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: "not found",
      });
    }
    user.verificationToken = null;
    user.verify = true;
    await user.save();

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Verification successful",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "missing required field email",
      });
    }

    if (user.verify) {
      return res.status(400).json({
        status: "Bad Request",
        code: 400,
        message: "Verification has already been passed",
      });
    }

    const verificationToken = createVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = {
  router,
  auth,
};
