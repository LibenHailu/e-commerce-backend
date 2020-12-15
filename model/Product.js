const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
  },
  image: String,
  rates: {
    type: Number,
    default: 0,
  },
  raters: {
    type: Number,
    default: 0,
  },
});

module.exports = model("product", productSchema);
