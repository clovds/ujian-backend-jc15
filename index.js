const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const { userRouter, movieRouter } = require("./routers");

// main app
const app = express();

// apply middleware
app.use(cors());
app.use(bodyparser.json());

// main route
const response = (req, res) =>
  res.status(200).send("<h1>REST API JCWM-15</h1>");
app.get("/", response);

// router
app.use("/user", userRouter);
app.use("/movies", movieRouter);

// bind to local machine
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => `CONNECTED : port ${PORT}`);
