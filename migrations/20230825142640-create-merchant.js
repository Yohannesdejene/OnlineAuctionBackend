'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Merchants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_name: {
        type: Sequelize.STRING
      },
      full_name: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      industrial_pref: {
        type: Sequelize.STRING
      },
      vatNumber: {
        type: Sequelize.INTEGER
      },
      identification: {
        type: Sequelize.STRING
      },
      licenseImage: {
        type: Sequelize.STRING
      },
      vatimg: {
        type: Sequelize.STRING
      },
      tendorimg: {
        type: Sequelize.STRING
      },
      tinNumber: {
        type: Sequelize.INTEGER
      },
      Approved: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Merchants');
  }
};