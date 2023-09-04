require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

const dns = require("dns");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const axios = require("axios");
function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const date = dateTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = dateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
  return `${date} at ${time}`;
}
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

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "yohannesdejene23@gmail.com",
    pass: "hhnrzkoruzeszfos",
  },
});
function checkInternetConnection(req, res, next) {
  dns.lookup("google.com", (err) => {
    if (err && err.code === "ENOTFOUND") {
      console.log("no internet");
      return res.status(400).send("No internet connection");
    }
    next();
  });
}

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

exports.createAuction = async (req, res, next) => {
  try {
    const {
      auctionName,
      startDate,
      endDate,
      description,
      category,
      rules,
      address,
      products,
    } = req.body;

    if (
      !auctionName ||
      !startDate ||
      !endDate ||
      !description ||
      // !category ||
      !rules ||
      !address ||
      !products
    ) {
      console.log("no datat");
      return res.status(400).json({ error: "Missing auction data" });
    }

    const parsedData = JSON.parse(products);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    const user = await User.findOne({ where: { id: req.user.id } });
    const company = await Company.findOne({ where: { id: user.CompanyId } });

    const image = req.file ? req.file.filename : null;

    const noOfProducts = parsedData.length;

    const auction = await Auction.create({
      id: "",
      auctionName,
      startDate,
      endDate,
      description,
      rules,
      address,
      category: category || 1,
      status: "open",
      image,
      noOfProducts,
      CompanyId: user.CompanyId,
    });

    for (const product of parsedData) {
      await Product.create({
        id: "",
        productName: product.productName,
        quantity: product.quantity,
        quality: null,
        measurment: product.measurment,
        description: product.description,
        AuctionId: auction.id,
      });
    }

    console.log("path", auction.image);
    const imageFilePath = path.join(
      __dirname,
      "..",
      "/uploads/",

      auction.image
    );
    const imageBuffer = fs.readFileSync(imageFilePath);

    const mergedValues = `Company Name: ${
      company.companyName
    }\n\n Description: ${auction.description}\n\nStart date: ${formatDateTime(
      auction.startDate
    )}\n\nEnd date: ${formatDateTime(auction.endDate)}\n\n No of products ${
      auction.noOfProducts
    }\n\n Rule: ${auction.rules}`;

    const username_for_channel = "cheretabott"; // Replace with the actual username
    const botUsername = "cheretabotbot"; // Replace with your bot's username
    //const startLink = `https://t.me/${botUsername}?start=${username_for_channel}${auction.id}`;
    const startLink = `https://t.me/${botUsername}?start=${username_for_channel}${
      auction.id
    }companyName=${"companyname"}`;

    // const replyMarkup = {
    //   inline_keyboard: [[{ text: "Apply for Chereta", url: startLink }]],
    // };

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "Apply for Chereta",
            url: startLink,
          },
        ],
      ],
      photo: [
        {
          type: "photo",
          media: { source: "attach://" + auction.image },
          thumb: { width: 1000, height: 200 }, // Set the thumbnail width and height
        },
      ],
    };

    // Add the entities to the reply markup

    const formData = new FormData();
    formData.append("chat_id", -1001912180590);

    formData.append("photo", imageBuffer, {
      filename: auction.image,
      contentType: "image/png",
    });

    formData.append(
      "caption",
      `${mergedValues}\n\nClick the button to apply for the Auction`
    );
    formData.append("reply_markup", JSON.stringify(replyMarkup));

    const apiUrl =
      "https://api.telegram.org/bot6348521019:AAH6wk_8eVjXd1dEuk7bR-Y7khI9JpiHppI/sendPhoto";
    // messages.forEach(async ({ mergedValues, replyMarkup }) => {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Message sent to Telegram channel:", response.data);
    // res.send("Message sent to Telegram channel");
    console.log("Message sent to Telegram channel");
    // });

    res.status(201).json({ message: "Auction created successfully" });
  } catch (error) {
    console.error("An error occurred while creating an auction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.myAuctions = async (req, res) => {
  const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  try {
    // Find the user's company
    const user = await User.findOne({
      where: { id: userId },
      include: { model: Company },
    });
    const companyId = await user.CompanyId;

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!companyId) {
      return res.status(404).send("Company not found");
    }

    const count = await Auction.count({
      where: { CompanyId: companyId },
    });

    const auctions = await Auction.findAll({
      where: { CompanyId: companyId },
      include: [{ model: Product }, { model: Company }],
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });

    if (!auctions) {
      return res.status(404).send("No auctions found");
    }

    return res.status(200).json({ auctions, count });
  } catch (error) {
    console.error("An error occurred while retrieving auctions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.myOpenAuctions = async (req, res) => {
  const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  try {
    // Find the user's company
    const user = await User.findOne({
      where: { id: userId },
      include: { model: Company },
    });
    const companyId = await user.CompanyId;

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!companyId) {
      return res.status(404).send("Company not found");
    }

    const count = await Auction.count({
      where: { CompanyId: companyId, status: "open" },
    });

    const auctions = await Auction.findAll({
      where: { CompanyId: companyId, status: "open" },
      include: [{ model: Product }, { model: Company }],
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });

    if (!auctions) {
      return res.status(404).send("No open auctions found");
    }

    return res.status(200).json({ auctions, count });
  } catch (error) {
    console.error("An error occurred while retrieving open auctions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.myClosedAuctions = async (req, res) => {
  const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  try {
    // Find the user's company
    const user = await User.findOne({
      where: { id: userId },
      include: { model: Company },
    });
    const companyId = await user.CompanyId;

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!companyId) {
      return res.status(404).send("Company not found");
    }

    const count = await Auction.count({
      where: { CompanyId: companyId, status: "closed" },
    });

    const auctions = await Auction.findAll({
      where: { CompanyId: companyId, status: "closed" },
      include: { model: Product },
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });

    if (!auctions) {
      return res.status(404).send("No closed auctions found");
    }

    return res.status(200).json({ auctions, count });
  } catch (error) {
    console.error("An error occurred while retrieving closed auctions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.detail = async (req, res) => {
  const { id } = req.params;

  try {
    const auction = await Auction.findOne({
      where: { id: id },
      include: { model: Product },
    });

    if (!auction) {
      return res.status(404).send("Auction not found");
    }

    return res.status(200).json({ auction });
  } catch (error) {
    console.error("An error occurred while retrieving auction details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.bids = async (req, res) => {
  const { auctionId } = req.params;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  try {
    const totalMerchants = await Merchant.count({
      distinct: true,
      include: [
        {
          model: Bid,
          where: {
            AuctionId: auctionId,
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
          },
          attributes: [],
        },
      ],
      limit: pageSize,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    if (!merchants || merchants.length === 0) {
      return res.status(404).send("No bids found");
    }

    return res.status(200).json({ totalMerchants, merchants });
  } catch (error) {
    console.error("An error occurred while retrieving bids:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.getOnePersonBid = async (req, res) => {
  const { auctionId, userId } = req.params;

  try {
    const bids = await Bid.findAll({
      where: {
        MerchantId: userId,
        AuctionId: auctionId,
      },
      include: [
        {
          model: Merchant,
        },
        {
          model: Auction,
          include: [
            {
              model: Product,
            },
          ],
        },
        {
          model: Product,
        },
      ],
    });

    if (!bids || bids.length === 0) {
      return res.status(404).send("No bids found for this user and auction");
    }

    return res.status(200).json({ bids });
  } catch (error) {
    console.error("An error occurred while retrieving person's bid:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.chooseWinner = async (req, res) => {
  const { auctionId, winnerId } = req.params;

  try {
    const auction = await Auction.findOne({
      where: { id: auctionId },
      include: [
        {
          model: Merchant,
          as: "winner",
          required: false,
        },
      ],
    });
    const company = await Company.findOne({
      where: { id: auction.CompanyId },
    });

    if (!auction) {
      return res.status(404).send(`Auction ${auctionId} not found`);
    }

    if (auction.winner) {
      return res.status(400).send(`Auction ${auctionId} already has a winner`);
    }

    const winner = await Merchant.findByPk(winnerId);

    if (!winner) {
      return res.status(404).send(`Merchant ${winnerId} not found`);
    }

    const updated = await Auction.update(
      { status: "closed" },
      { where: { id: auctionId } }
    );
    const mergedValues = `Company Name: ${
      company.companyName
    }\n\n Description: ${auction.description}\n\nStart date: ${formatDateTime(
      auction.startDate
    )}\n\nEnd date: ${formatDateTime(auction.endDate)}\n\n No of products  :${
      auction.noOfProducts
    }\n\n Rule: ${auction.rules}`;

    const apiUrl =
      "https://api.telegram.org/bot6348521019:AAH6wk_8eVjXd1dEuk7bR-Y7khI9JpiHppI/sendMessage";
    // messages.forEach(async ({ mergedValues, replyMarkup }) => {
    const response = await axios.post(apiUrl, {
      chat_id: -1001912180590,
      text: `Alert   🪒    ${winner.company_name} selected as  winner for the auction \n\n ${mergedValues}`,
    });

    // messages.forEach(async ({ mergedValues, replyMarkup }) => {
    const responseToWinner = await axios.post(apiUrl, {
      chat_id: winner.id,
      text: `You have been the winner for this auction \n ${mergedValues}`,
    });

    console.log("Message sent to Telegram channel:", response.data);

    await auction.setWinner(winner);

    return res.send(`Winner ${winnerId} registered for auction ${auctionId}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
exports.getWinner = async (req, res) => {
  const auctionId = req.params.auctionId;

  try {
    const auction = await Auction.findOne({
      where: { id: auctionId },
      include: [
        {
          model: Merchant,
          as: "winner",
          required: false,
        },
      ],
    });

    if (!auction) {
      return res.status(500).json({ error: `Auction ${auctionId} not found` });
    }

    if (!auction.winner) {
      return res.status(404).send(`Auction ${auctionId} has no winner`);
    }

    return res.json(auction.toJSON());
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
exports.allOpenAuction = async (req, res) => {
  const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  try {
    const count = await Auction.count({
      where: { status: "open" },
    });

    const auctions = await Auction.findAll({
      where: { status: "open" },
      include: [{ model: Product }, { model: Company }],
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });
    if (!auctions) {
      return res.status(404).send("eroror in thnmcerc");
    }
    console.log(auctions);
    return res.status(200).json({ auctions, count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.allClosedAuction = async (req, res) => {
  const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  try {
    // Find the user's company
    const count = await Auction.count({
      where: { status: "closed" },
    });
    const auctions = await Auction.findAll({
      where: { status: "closed" },
      include: [{ model: Product }, { model: Company }],
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });
    if (!auctions) {
      return res.status(404).json({ error: "auction not found" });
    }

    return res.status(200).json({ auctions, count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
