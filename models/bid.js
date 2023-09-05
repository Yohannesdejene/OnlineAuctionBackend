const { uid } = require("uid");
("use strict");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bid extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Auction, Merchant, Product }) {
      // define association here
      Bid.belongsTo(Auction);
      Bid.belongsTo(Merchant);
      Bid.belongsTo(Product);
    }
  }
  Bid.init(
    {
      id: {
        set(value) {
          let x = uid(16);
          // Storing passwords in plaintext in the database is terrible.
          // Hashing the value with an appropriate cryptographic hash function is better.
          this.setDataValue("id", x);
        },
        type: DataTypes.STRING,
        primaryKey: true,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.NOW,
      },
    },
    {
      sequelize,
      modelName: "Bid",
      tableName: "bids",
    }
  );
  return Bid;
};
