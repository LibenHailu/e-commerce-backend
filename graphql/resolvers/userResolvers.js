const User = require("../../model/User");
const checkAuth = require("../../utils/checkAuth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { UserInputError } = require("apollo-server");
const { AuthenticationError } = require("apollo-server");
const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateInput,
} = require("../../utils/validators");

const saltRounds = 10;

function generateToken(user) {
  let token = jwt.sign(
    {
      username: user.username,
      id: user.id,
      email: user.email,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  return {
    ...user._doc,
    id: user._id,
    token,
  };
}

module.exports = {
  Mutation: {
    registerUser: async (_, { input }) => {
      const { username, email, password, confirmPassword } = input;

      // validating user inputs
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      try {
        hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await new User({
          username,
          email,
          password: hashedPassword,
        }).save();

        return generateToken(user);
      } catch (err) {
        return new AuthenticationError("Errors", "User exists");
      }
    },

    loginUser: async (_, { email, password }) => {
      const { valid, errors } = validateLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      try {
        const user = await User.findOne({ email });

        const match = await bcrypt.compare(password, user.password);

        if (match) {
          return generateToken(user);
        }

        return new AuthenticationError("User not found");
      } catch (err) {
        return new Error("User not found");
      }
    },

    updateUser: async (_, { input }, { req }) => {
      const authUser = await checkAuth(req);
      const { username, email, oldPassword, newPassword } = input;

      // validating user inputs
      const { valid, errors } = validateUpdateInput(
        username,
        email,
        oldPassword,
        newPassword
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      try {
        const user = await User.findById(authUser.id);

        const match = await bcrypt.compare(oldPassword, user.password);
        if (match) {
          user.username = username;
          user.email = email;
          user.password = newPassword;
          await user.save();
        } else {
          return new Error("old password is incorrect");
        }

        return generateToken(user);
      } catch (err) {
        new AuthenticationError("Errors", "User does not exists");
      }
    },

    deleteUser: async (_, __, { req }) => {
      try {
        const authUser = await checkAuth(req);

        const user = await User.findOne({ _id: authUser.id });

        if (user) {
          await User.deleteOne({ _id: authUser.id });
          return user;
        }

        return new AuthenticationError("User not found");
      } catch (err) {
        return new AuthenticationError("User not found");
      }
    },
  },
};
