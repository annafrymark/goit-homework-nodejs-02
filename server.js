const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

require("dotenv").config();

const app = express();

// const app = require("./app");

// parse application/json
app.use(express.json());
// cors
app.use(cors());

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_URI;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: false,
});

connection
  .then(() => {
    app.listen(PORT, function () {
      console.log("Database connection successful");
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
