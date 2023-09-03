const { uid } = require("uid");
("use strict");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Company, createdBy }) {
      User.belongsTo(Company);
      User.belongsTo(User, {
        as: "manager",
        foreignKey: "managerId",
      });

      User.hasMany(User, {
        as: "users",
        foreignKey: "managerId",
      });
    }
  }
  User.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,

        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 5,
      },

      //// userType  1=mainAdmin  2=sales 3=companyAdmin 4 =procurment 5=assistant  6=merchants
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
