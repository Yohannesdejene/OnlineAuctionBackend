const { uid } = require("uid");
("use strict");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Merchant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Merchant, Auction, Bid }) {
      // define association here
      Merchant.hasMany(Bid);
      Merchant.hasMany(Auction, { foreignKey: "winnerId", as: "wonAuctions" });
    }
  }
  Merchant.init(
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
      company_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      industrial_pref: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vatNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      identification: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      licenseImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vatimg: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tendorimg: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tinNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Approved: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Merchant",
      tableName: "merchants",
    }
  );
  return Merchant;
};
