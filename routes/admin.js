require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const fs = require("fs");
var bodyParser = require("body-parser");

const cors = require("cors");
const { uid } = require("uid");
const date = new Date();
const { User, Product, Company, Auction, Product_Auction } = sequelize.models;

router.use(
  cors({
    origin: [
      "http://localhost:7494",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

module.exports = router;
