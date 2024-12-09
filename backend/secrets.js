const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const MONGO_URI = process.env.MONGO_URI;
const GENERATIVE_API_KEY = process.env.GENERATIVE_API_KEY;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;

module.exports = {
  MONGO_URI,
  AWS_ACCESS_KEY,
  AWS_SECRET,
  GENERATIVE_API_KEY,
  EMAIL,
  PASSWORD,
  AWS_BUCKET_NAME,
};
