require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const app = express();
var cookieParser = require("cookie-parser");
const { json } = require("express");

const { Op } = require("sequelize");
const axios = require("axios");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const auctionRoute = require("./routes/auction");
const admin = require("./routes/admin");
const {
  User,
  Product,
  Company,
  Auction,
  Product_Auction,
  Passcode,
  createdBy,
  Merchant,
  Bid,
  ProductBid,
  PdfFile,
} = sequelize.models;

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["https://ethchereta.com", "http://localhost:5173"],

    credentials: true,
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

async function tableChange() {
  //  a function used to commit database changes just change name of model you want to update and call function

  // await User.sync({ alter: true });
  // await Company.sync({ alter: true });
  // await Auction.sync({ alter: true });
  // await Product.sync({ alter: true });

  // await Passcode.sync({ alter: true });
  await Merchant.sync({ alter: true });
  // await Bid.sync({ alter: true });
  // await ProductBid.sync({ force: true });
  await PdfFile.sync({ alter: true });

  // sequelize.sync({ force: true });
  console.log("finished");
}

// tableChange();

// app.use(jsonParser);
app.use(cookieParser());
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/auction", auctionRoute);
app.use("/api/admin", admin);

app.get("/", (req, res) => {
  res.send("Now  connected");
});

app.get("/get", (req, res) => {
  res.send("change finished");
});

app.get("/api/auctionImage/:auctionId", (req, res) => {
  let id = req.params.auctionId;
  console.log("fetch image - ", id);
  return Auction.findOne({
    where: { id: id },
  })
    .then((data) => {
      console.log("image", data.image);
      // console.log("The data found is ", data);
      if (data) {
        return data.image;
      }
    })
    .then((data) => {
      if (data) {
        res.sendFile(__dirname + "/uploads/" + data);
      } else {
        res.status(404).send("Image not found");
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).send({ error: err });
    });
});

app.get("/api/checkAuctionStatus", async (req, res) => {
  try {
    // Find all open auctions with end date and time less than the current date and time
    const auctions = await Auction.findAll({
      where: {
        status: "open",
        endDate: {
          [Op.lt]: new Date(),
        },
      },
    });
    console.log("open auction", auctions.length);
    // Update each auction's status to closed
    let sum = 0;
    for (const auction of auctions) {
      const endDate = new Date(auction.endDate);

      // Check if the end date and time have passed
      if (endDate < new Date()) {
        sum += 1;
        await auction.update({ status: "closed" });
      }
    }
    console.log(" we have updates  ", sum);

    res.status(200).json({ message: "Auction statuses updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});
const callAuctionStatusAPI = async () => {
  try {
    // Make a request to the API endpoint using Axios
    await axios.get("http://localhost:3000/checkAuctionStatus");
    console.log("API called successfully.");
  } catch (error) {
    console.error("Error calling the API:", error);
  }
};

// Schedule the API call every 10 minutes
const interval = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// const interval = 10 * 60 * 1000; // 10 minutes in milliseconds
setInterval(callAuctionStatusAPI, interval);

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is Successfully Running in post ", PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
