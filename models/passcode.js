const { uid } = require("uid");
("use strict");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Passcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Passcode.init(
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
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Passcode",
      tableName: "passcodes",
    }
  );
  return Passcode;
};
