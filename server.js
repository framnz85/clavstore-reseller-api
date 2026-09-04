const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

const app = express();

const { connectRedis } = require("./config/redis");

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

const allowedOrigins = [
  "https://reselify.com",
  "https://www.reselify.com",
  "https://clavstore.com",
  "https://www.clavstore.com",
  "https://learnclavstore.com",
  "https://www.learnclavstore.com",
  "http://localhost:3001",
  "http://localhost:3004",
  "http://localhost:3005",
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

readdirSync("./routes").map((file) =>
  app.use("/" + process.env.API_ROUTES, require("./routes/" + file)),
);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

const rport = process.env.REDIS_PORT || 8000;
const startServer = async () => {
  try {
    await connectRedis();

    app.listen(rport, () => {
      console.log(`Server running on port ${rport}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
