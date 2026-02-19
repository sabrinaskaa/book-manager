import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../lib/sequelize";

export class Book extends Model<
  InferAttributes<Book>,
  InferCreationAttributes<Book>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare author: string;
  declare publicationDate: string;
  declare publisher: string;
  declare pages: number;
  declare categoryId: number;
  declare imageUrl: string;
}

Book.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    author: { type: DataTypes.STRING(255), allowNull: false },
    publicationDate: { type: DataTypes.DATEONLY, allowNull: false },
    publisher: { type: DataTypes.STRING(255), allowNull: false },
    pages: { type: DataTypes.INTEGER, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    imageUrl: { type: DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, tableName: "books", timestamps: true },
);
