const Product = require("../../model/Product");

module.exports = {
  Query: {
    getProductPage: async (_, { pageNum, pageSize }) => {
      try {
        let products;
        if (pageNum === 1) {
          products = await Product.find({}).sort({}).limit(pageSize);
        } else {
          // if page is greater than one figure out how many posts to skip
          const skips = pageSize * (pageNum - 1);
          products = await Product.find({})
            .sort({})
            .skip(skips)
            .limit(pageSize);
        }
        const totalDocs = await Product.countDocuments();
        const hasMore = totalDocs > pageSize * pageNum;

        // calculating rates
        products.forEach((prod) => {
          if (prod.rates && prod.raters) {
            prod.rate = prod.rates / prod.raters;
          } else {
            prod.rate = 0;
          }
        });

        return { products, hasMore };
      } catch (err) {
        console.log(err);
        return new Error(err);
      }
    },

    product: async (_, { id }) => {
      try {
        const product = await Product.findById(id);

        if (product.rates && product.raters) {
          product.rate = product.rates / product.raters;
        } else {
          product.rate = 0;
        }

        let ratedProduct = {
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          image: product.image,
          rate: product.rate,
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
