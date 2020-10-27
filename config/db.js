const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost/recipe", {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("database connected");
  } catch (err) {
    console.error(err.message);
    process.exit(-1);
  }
};

module.exports = connectDb;
