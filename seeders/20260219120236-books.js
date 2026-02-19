"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("books", [
      {
        title: "Laut Bercerita",
        author: "Leila S. Chudori",
        publicationDate: "2017-10-19",
        publisher: "Kepustakaan Populer Gramedia",
        imageUrl: "/uploads/laut-bercerita.jpeg",
        pages: 390,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "White Nights",
        author: "Fyodor Dostoevsky",
        publicationDate: "2016-03-03",
        publisher: "Penguin Classics",
        imageUrl: "/uploads/white-nights.jpeg",
        pages: 240,
        categoryId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("books", null, {});
  },
};
