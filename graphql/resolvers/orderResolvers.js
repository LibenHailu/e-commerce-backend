const Order = require("../../model/Order");
const { AuthenticationError, UserInputError } = require("apollo-server");
const checkAuth = require("../../utils/checkAuth");

module.exports = {
  Query: {
    getOrderPage: async (_, { pageNum, pageSize }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        let order;
        let user;
        let products;
        if (pageNum === 1) {
          order = await Order.findOne({ user: authUser.id });
          user = await Order.findOne({
            user: authUser.id,
          }).populate("user");

          products = await Order.findOne({
            user: authUser.id,
          }).populate({
            path: "products.product",
            model: "Product",
            options: {
              limit: pageSize,
            },
          });
        } else {
          // if page is greater than one figure out how many posts to skip
          const skips = pageSize * (pageNum - 1);
          order = await Order.findOne({ user: authUser.id });
          user = await Order.findOne({
            user: authUser.id,
          }).populate("user");

          products = await Order.findOne({
            user: authUser.id,
          }).populate({
            path: "products.product",
            model: "Product",
            options: {
              skip: skips,
              limit: pageSize,
            },
          });
        }

        const totalDocs = await Order.countDocuments();
        const hasMore = totalDocs > pageSize * pageNum;

        let newProducts = products.products.filter((prod) => {
          if (prod.product) {
            if (prod.product.rates && prod.product.raters) {
              prod.product.rate = prod.product.rates / prod.product.raters;
            } else {
              prod.product.rate = 0;
            }

            prod.user = user.user;
            return prod;
          }
        });
        return {
          id: order._id,
          user: user.user,
          orders: newProducts,
          hasMore,
        };
      } catch (err) {
        return new Error(err);
      }
    },
  },
  Mutation: {
    addOrder: async (_, { product, quantity }, { req }) => {
      try {
        const authUser = await checkAuth(req);
        let order = await Order.findOne({ user: authUser.id });

        if (order) {
          let changed = order.products.filter((prod) => {
            return prod.product.toString() === product;
          });

          let unChanged = order.products.filter((prod) => {
            return prod.product.toString() !== product;
          });
          if (changed.length > 0) {
            changed[0].quantity = changed[0].quantity + quantity;

            order.products = [...changed, ...unChanged];
            order.save();
          } else {
            changed = [{ product, quantity }];
            order.products = [...changed, ...unChanged];
            order.save();
          }
        } else {
          order = await new Order({
            user: authUser.id,
            products: [{ product, quantity }],
          }).save();
        }

        // all the code below is written separetly because i was having issues with async action in deep populate
        const ord = await Order.findOne({
          user: authUser.id,
        });

        const user = await Order.findOne({
          user: authUser.id,
        }).populate("user");

        const prod = await Order.findOne({
          user: authUser.id,
        }).populate({ path: "products.product", model: "Product" });

        let myProduct = {
          _id: ord._id,
          user: user.user,
          products: prod.products,
        };

        myProduct.user.password = "";
        // // calculating rate
        if (
          myProduct.products[0].product.rates &&
          myProduct.products[0].product.raters
        ) {
          myProduct.products[0].product.rate =
            myProduct.products[0].product.rates /
            myProduct.products[0].product.raters;
        } else {
          myProduct.products[0].product.rate = 0;
        }

        return {
          id: myProduct._id,
          user: myProduct.user,
          product: myProduct.products[0].product,
          quantity: myProduct.products[0].quantity,
        };
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Invalid/Expired token");
      }
    },

    deleteOrder: async (_, { product }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const allOrders = await Order.findOne({ user: authUser.id })
          .populate("user")
          .populate({ path: "products.product", model: "Product" });

        const order = await Order.findOne({ user: authUser.id });

        const newOrders = order.products.filter((prod) => {
          return prod.product.toString() !== product;
        });

        if (order.products !== newOrders) {
          order.products = newOrders;

          await order.save();
        }

        let deletedOrder = allOrders.products.filter((prod) => {
          if (prod.product._id.toString() === product) {
            return prod;
          }
        });

        if (deletedOrder.length > 0) {
          allOrders.user.password = "";
          // calculating rate
          if (deletedOrder[0].rates && deletedOrder[0].raters) {
            deletedOrder[0].rate =
              deletedOrder[0].rates / deletedOrder[0].raters;
          } else {
            deletedOrder[0].product.rate = 0;
          }

          return {
            id: allOrders._id,
            quantity: deletedOrder[0].quantity,
            user: allOrders.user,
            product: deletedOrder[0].product,
          };
        } else {
          return new UserInputError("Order not found", {
            order: "invalid order id",
          });
        }
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Invalid/Expired token");
      }
    },

    clearOrders: async (_, __, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const order = await Order.findOne({ user: authUser.id });

        if (order) {
          await Order.deleteOne({ _id: order._id });

          return {
            code: "200",
            success: true,
            message: "Successfully cleared Order lists",
          };
        } else {
          return {
            code: "424",
            success: false,
            message: "No Order lists",
          };
        }
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    },
  },
};
