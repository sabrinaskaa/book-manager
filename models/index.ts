import { Category } from "./Category";
import { Book } from "./Book";

Category.hasMany(Book, { foreignKey: "categoryId", as: "books" });
Book.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

export { Category, Book };
