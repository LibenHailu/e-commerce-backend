const User = require("../../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { UserInputError } = require("apollo-server");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");

const saltRounds = 10;

function generateToken(user) {
  // generating token
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
  Query: {
    getUser: async (_, { email, password }) => {
      // validating user inputs
      const { valid, errors } = validateLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      try {
        // logging in user
        const user = await User.findOne({ email });

        const match = await bcrypt.compare(password, user.password);

        if (match) {
          generateToken(user);
        }

        return new Error("User not found");
      } catch (err) {
        return new Error("User not found");
      }
    },
  },
  Mutation: {
    // registers user
    addUser: async (_, { username, email, password, confirmPassword }) => {
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
        // hasing password
        hashedPassword = await bcrypt.hash(password, saltRounds);

        // adding user to databse
        const user = await new User({
          username,
          email,
          password: hashedPassword,
        }).save();

        return generateToken(user);
      } catch (err) {
        return new Error("User exists");
      }
    },
    // login user with correct credentials
    loginUser: async (_, { email, password }) => {
      // validating user inputs
      const { valid, errors } = validateLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      try {
        // logging in user
        const user = await User.findOne({ email });

        const match = await bcrypt.compare(password, user.password);

        if (match) {
          return generateToken(user);
        }

        return new Error("User not found");
      } catch (err) {
        return new Error("User not found");
      }
    },
  },
};
