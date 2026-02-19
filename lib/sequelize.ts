import { Sequelize } from "sequelize";

declare global {
  var __sequelize: Sequelize | undefined;
}

export const sequelize =
  global.__sequelize ??
  new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      dialect: "mysql",
      logging: false,
      pool: { max: 10, min: 0, idle: 10000 },
    },
  );

if (process.env.NODE_ENV !== "production") global.__sequelize = sequelize;
