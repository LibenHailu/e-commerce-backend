const Cart = require("../../model/Cart");
const Order = require("../../model/Order");
const { AuthenticationError, UserInputError } = require("apollo-server");
const checkAuth = require("../../utils/checkAuth");

module.exports = {
  Query: {
    getCartPage: async (_, { pageNum, pageSize }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        let cart;
        let user;
        let products;
        if (pageNum === 1) {
          cart = await Cart.findOne({ user: authUser.id });
          user = await Cart.findOne({
            user: authUser.id,
          }).populate("user");

          products = await Cart.findOne({
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
          cart = await Cart.findOne({ user: authUser.id });
          user = await Cart.findOne({
            user: authUser.id,
          }).populate("user");

          products = await Cart.findOne({
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

        const totalDocs = cart.products.length;
        const hasMore = totalDocs > pageSize * pageNum;

        let newProducts = products.products.filter((prod) => {
          if (prod.product) {
            if (prod.product.rates && prod.product.raters) {
              prod.product.rate = prod.product.rates / prod.product.raters;
            } else {
              prod.product.rate = 0;
            }

            return prod;
          }
        });

        return {
          id: cart._id,
          user: user.user,
          myCart: newProducts,
          hasMore,
        };
      } catch (err) {
        console.log(err);
        return new Error(err);
      }
    },
  },
  Mutation: {
    addToCart: async (_, { product, quantity }, { req }) => {
      try {
        const authUser = await checkAuth(req);
        let cart = await Cart.findOne({ user: authUser.id });

        if (cart) {
          let changed = cart.products.filter((prod) => {
            return prod.product.toString() === product;
          });

          let unChanged = cart.products.filter((prod) => {
            return prod.product.toString() !== product;
          });
          if ((changed.length = 0)) {
            changed[0].quantity = changed[0].quantity + quantity;

            cart.products = [...changed, ...unChanged];
            cart.save();
          } else {
            changed = [{ product, quantity }];
            cart.products = [...changed, ...unChanged];
            cart.save();
          }
        } else {
          cart = await new Cart({
            user: authUser.id,
            products: [{ product, quantity }],
          }).save();
        }

        // all the code below is written separetly because i was having issues with async action in deep populate
        const ord = await Cart.findOne({
          user: authUser.id,
        });

        const user = await Cart.findOne({
          user: authUser.id,
        }).populate("user");

        const prod = await Cart.findOne({
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

    deleteFromCart: async (_, { product }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const allCarts = await Cart.findOne({ user: authUser.id })
          .populate("user")
          .populate({ path: "products.product", model: "Product" });

        const cart = await Cart.findOne({ user: authUser.id });

        const newCarts = cart.products.filter((prod) => {
          return prod.product.toString() !== product;
        });

        if (cart.products !== newCarts) {
          cart.products = newCarts;

          await cart.save();
        }

        let deletedCart = allCarts.products.filter((prod) => {
          if (prod.product._id.toString() === product) {
            return prod;
          }
        });

        if (deletedCart.length > 0) {
          allCarts.user.password = "";
          // calculating rate
          if (deletedCart[0].rates && deletedCart[0].raters) {
            deletedCart[0].rate = deletedCart[0].rates / deletedCart[0].raters;
          } else {
            deletedCart[0].product.rate = 0;
          }

          return {
            id: allCarts._id,
            quantity: deletedCart[0].quantity,
            user: allCarts.user,
            product: deletedCart[0].product,
          };
        } else {
          return new UserInputError("cart not found", {
            cart: "invalid cart id",
          });
        }
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Invalid/Expired token");
      }
    },

    clearMyCart: async (_, __, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const cart = await Cart.findOne({ user: authUser.id });

        if (cart) {
          await Cart.deleteOne({ _id: cart._id });

          return {
            code: "200",
            success: true,
            message: "Cart Successfully cleared",
          };
        } else {
          return {
            code: "424",
            success: false,
            message: "No My cart list",
          };
        }
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Invalid/Expired token");
      }
    },

    checkOut: async (_, { product }, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const allCarts = await Cart.findOne({ user: authUser.id })
          .populate("user")
          .populate({ path: "products.product", model: "Product" });

        const cart = await Cart.findOne({ user: authUser.id });

        const newCarts = cart.products.filter((prod) => {
          return prod.product.toString() !== product;
        });

        if (cart.products !== newCarts) {
          cart.products = newCarts;

          await cart.save();
        }

        let deletedCart = allCarts.products.filter((prod) => {
          if (prod.product._id.toString() === product) {
            return prod;
          }
        });

        if (deletedCart.length > 0) {
          allCarts.user.password = "";
          // calculating rate
          if (deletedCart[0].rates && deletedCart[0].raters) {
            deletedCart[0].rate = deletedCart[0].rates / deletedCart[0].raters;
          } else {
            deletedCart[0].product.rate = 0;
          }

          addOrder(authUser, product, deletedCart[0].quantity);

          return {
            id: allCarts._id,
            quantity: deletedCart[0].quantity,
            user: allCarts.user,
            product: deletedCart[0].product,
          };
        } else {
          return new UserInputError("cart not found", {
            cart: "invalid cart id",
          });
        }
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Invalid/Expired token");
      }
    },
  },
};

async function addOrder(authUser, product, quantity) {
  try {
    const order = await Order.findOne({ user: authUser.id });

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
  } catch (err) {
    return new Error("Server Error");
  }
}
