"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("books", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      author: { type: Sequelize.STRING(255), allowNull: false },
      publicationDate: { type: Sequelize.DATEONLY, allowNull: false },
      publisher: { type: Sequelize.STRING(255), allowNull: false },
      pages: { type: Sequelize.INTEGER, allowNull: false },

      categoryId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      imageUrl: { type: Sequelize.STRING(255), allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
