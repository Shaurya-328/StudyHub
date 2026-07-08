// connect mongodb and nodejs

const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL } = process.env;

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("DB connected successfully");
        })
        .catch((error) => {
            console.log("DB connection failed");
            console.error(error);
            process.exit(1);
        });
};