const Product = require("../../model/Product");

module.exports = {
  Query: {
    product: async (_, { id }) => {
      try {
        const product = await Product.findById(id);

        let ratedProduct = {
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          image: product.image,
          rate: product.rates / product.raters,
        };

        return ratedProduct;
      } catch (err) {
        throw new Error("Server Error");
      }
    },
  },

  Mutation: {
    addProduct: async (_, { input }) => {
      try {
        const newProduct = await new Product(input).save();
        return newProduct;
      } catch (err) {
        throw new Error("please check input");
      }
    },

    addRate: async (_, { id, rate }) => {
      try {
        const product = await Product.findById(id, (_, doc) => {
          console.log(doc);
          doc.rates = doc.rates + rate;
          doc.raters = doc.raters + 1;
          doc.save();
        });

        let ratedProduct = {
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          image: product.image,
          rate: product.rates / product.raters,
        };

        return ratedProduct;
      } catch (err) {
        throw new Error("Server Error");
      }
    },
  },
};
