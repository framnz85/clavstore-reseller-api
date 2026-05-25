const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

const allowedOrigins = ["http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

readdirSync("./routes").map((file) =>
  app.use("/" + process.env.API_ROUTES, require("./routes/" + file)),
);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
