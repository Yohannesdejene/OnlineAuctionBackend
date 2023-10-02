require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const multer = require("multer");
const dns = require("dns");

const auctionController = require("../Controllers/auctionController");

const {
  User,
  Product,
  Company,
  Auction,
  Product_Auction,
  Passcode,
  Bid,
  Merchant,
} = sequelize.models;

function checkInternetConnection(req, res, next) {
  dns.lookup("google.com", (err) => {
    if (err && err.code === "ENOTFOUND") {
      console.log("no internet");
      return res.status(400).send("No internet connection");
    }
    next();
  });
}
const authCheck = async (req, res, next) => {
  console.log("cookies", req.cookies);
  console.log("headers", req.headers);

  console.log("checking data", req.cookies.u);
  if (req.cookies.u) {
    console.log("in the first check");
    const token = req.cookies.u;
    if (token == null) {
      res.status(403).send("not logged in");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log("verifing");
      if (err) {
        console.log("Token error is ", err);
        res.status(403).send("not logged in");
      } else {
        console.log("decoded toklen", user);
        req.user = user;
        console.log("req.user", req.user);
        next();
      }
    });
  } else if (req.headers.cookies) {
    console.log("in the second check");
    let contentincookie = req.headers.cookies;
    const token = contentincookie.slice(0);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
      }
      console.log("the request user is ", user);
      req.user = user;
      next();
    });
  } else {
    console.log("no cookie");
    res.sendStatus(403);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/createAuction",
  checkInternetConnection,
  authCheck,
  upload.single("image"),
  auctionController.createAuction
);

router.get(
  "/myauctions",
  checkInternetConnection,
  authCheck,
  auctionController.myAuctions
);

router.get(
  "/myOpenAuctions",
  checkInternetConnection,
  authCheck,
  auctionController.myOpenAuctions
);

router.get(
  "/myClosedauctions",
  checkInternetConnection,
  authCheck,
  auctionController.myClosedAuctions
);

router.get(
  "/detail/:id",
  checkInternetConnection,
  authCheck,
  auctionController.detail
);

router.get(
  "/bids/:auctionId",
  checkInternetConnection,
  authCheck,
  auctionController.bids
);

router.get("/highPrice/:auctionId/:productId", async (req, res) => {
  const { auctionId } = req.params;
  const { productId } = req.params;

  // const { page } = req.query;
  // const pageSize = 10;
  // const offset = (page - 1) * pageSize;
  try {
    const totalMerchants = await Merchant.count({
      distinct: true,
      include: [
        {
          model: Bid,
          where: {
            AuctionId: auctionId,
            ProductId: productId,
          },
          attributes: [],
        },
      ],
    });

    const merchants = await Merchant.findAll({
      include: [
        {
          model: Bid,
          where: {
            AuctionId: auctionId,
            ProductId: productId,
          },
          attributes: [],
        },
      ],

      order: [["createdAt", "DESC"]],
    });
    const highestBid = await Bid;

    if (!merchants || merchants.length === 0) {
      return res.status(404).send("No bids found");
    }

    return res.status(200).json({ totalMerchants, merchants });
  } catch (error) {
    console.error("An error occurred while retrieving bids:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/getOnePersonBid/:auctionId/:userId",
  checkInternetConnection,
  authCheck,
  auctionController.getOnePersonBid
);

router.put(
  "/chooseWinner/:auctionId/:winnerId",
  checkInternetConnection,
  authCheck,
  auctionController.chooseWinner
);

router.get(
  "/winner/:auctionId",
  checkInternetConnection,
  authCheck,
  auctionController.getWinner
);

router.get(
  "/allOpenAuction",
  checkInternetConnection,
  authCheck,
  auctionController.allOpenAuction
);

router.get(
  "/allClosedAuction",
  checkInternetConnection,
  authCheck,
  auctionController.allClosedAuction
);
router.get(
  "/myAuctionsStats",
  checkInternetConnection,
  authCheck,
  auctionController.myAuctionStats
);
router.put(
  "/closeAuctionBeforeTime/:auctionId",
  checkInternetConnection,
  authCheck,
  auctionController.closeAuctionBeforeTime
);

router.get(
  "/stats",
  checkInternetConnection,
  authCheck,
  auctionController.stats
);

///////


module.exports = router;
