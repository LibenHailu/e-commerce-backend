const checkAuth = require("../../utils/checkAuth");
const Like = require("../../model/Like");
const { AuthenticationError } = require("apollo-server");

module.exports = {
  Query: {
    getLikePage: async (_, { pageNum, pageSize }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        let like;
        let user;
        let products;
        if (pageNum === 1) {
          like = await Like.findOne({ user: authUser.id });
          user = await Like.findOne({
            user: authUser.id,
          }).populate("user");

          products = await Like.findOne({
            user: authUser.id,
          }).populate({
            path: "products",
            model: "Product",
            options: {
              limit: pageSize,
            },
          });
        } else {
          // if page is greater than one figure out how many posts to skip
          const skips = pageSize * (pageNum - 1);
          like = await Like.findOne({ user: authUser.id });
          user = await Like.findOne({
            user: authUser.id,
          }).populate("user");

          products = await Like.findOne({
            user: authUser.id,
          }).populate({
            path: "products",
            model: "Product",
            options: {
              skip: skips,
              limit: pageSize,
            },
          });
        }

        let newProducts = products.products.filter((prod) => {
          if (prod.rates && prod.raters) {
            prod.rate = prod.rates / prod.raters;
          } else {
            prod.rate = 0;
          }
          return prod;
        });

        const totalDocs = like.products.length;
        const hasMore = totalDocs > pageSize * pageNum;

        return {
          id: like._id,
          user: user.user,
          likes: newProducts,
          hasMore,
        };
      } catch (err) {
        return new Error(err);
      }
    },
  },
  Mutation: {
    addLike: async (_, { product }, { req }) => {
      try {
        const authUser = await checkAuth(req);
        const like = await Like.findOne({ user: authUser.id });

        if (like) {
          if (!like.products.includes(product)) {
            like.products = [product, ...like.products];
            await like.save();
          }
        } else {
          like = await new Like({
            user: authUser.id,
            products: [product],
          }).save();
        }

        const newLike = await Like.findOne({ user: authUser.id })
          .populate("user")
          .populate("products");

        newLike.user.password = "";
        // calculating rate
        if (newLike.products[0].rates && newLike.products[0].raters) {
          newLike.products[0].rate =
            newLike.products[0].rates / newLike.products[0].raters;
        } else {
          newLike.products[0].rate = 0;
        }

        return {
          id: newLike._id,
          user: newLike.user,
          product: newLike.products[0],
        };
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Invalid/Expired token");
      }
    },

    deleteLike: async (_, { product }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const allLikes = await Like.findOne({ user: authUser.id })
          .populate("user")
          .populate("products");

        const like = await Like.findOne({ user: authUser.id });

        const newProducts = like.products.filter((prod) => {
          return prod.toString() !== product;
        });

        if (like.products !== newProducts) {
          like.products = newProducts;

          await like.save();
        }

        let deletedLike = allLikes.products.filter((prod) => {
          if (prod._id.toString() === product) {
            return prod;
          }
        });

        allLikes.user.password = "";
        // calculating rate
        if (deletedLike[0].rates && deletedLike[0].raters) {
          deletedLike[0].rate = deletedLike[0].rates / deletedLike[0].raters;
        } else {
          deletedLike[0].rate = 0;
        }

        return {
          id: allLikes._id,
          user: allLikes.user,
          product: deletedLike[0],
        };
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    },

    clearLikes: async (_, __, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const like = await Like.findOne({ user: authUser.id });

        if (like) {
          await Like.deleteOne({ _id: like._id });

          return {
            code: "200",
            success: true,
            message: "Successfully cleared watched list",
          };
        } else {
          return {
            code: "424",
            success: false,
            message: "No Watched list",
          };
        }
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    },
  },
};
