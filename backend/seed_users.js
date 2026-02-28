
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "config.env") });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection error:", err));

const users = [
  {
    name: "Adarsh",
    nameId: "adarsh",
    password: "test1234",
    passwordConfirm: "test1234",
    role: "user",
  },
  {
    name: "Sarthak",
    nameId: "sarthak",
    password: "test1234",
    passwordConfirm: "test1234",
    role: "user",
  },
  {
    name: "Lavlesh",
    nameId: "lavlesh",
    password: "test1234",
    passwordConfirm: "test1234",
    role: "user",
  },
];

const seedUsers = async () => {
  try {
    for (const u of users) {
      const exists = await User.findOne({ nameId: u.nameId });
      if (!exists) {
        await User.create(u);
        console.log(`User ${u.name} created.`);
      } else {
        console.log(`User ${u.name} already exists.`);
      }
    }
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seedUsers();
