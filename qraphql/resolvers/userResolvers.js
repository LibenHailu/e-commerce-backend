const User = require("../../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const saltRounds = 10;

module.exports = {
  Query: {
    getUser: async (_, { email, password }) => {
      try {
        // logging in user
        const user = await User.findOne({ email });

        const match = await bcrypt.compare(password, user.password);

        if (match) {
          // generating token
          let token = jwt.sign(
            {
              ierName: user.userName,
              emad: user.id,
              usil: user.email,
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

        return new Error("User not found");
      } catch (err) {
        return new Error("User not found");
      }
    },
  },

  Mutation: {
    addUser: async (_, { userName, email, password }) => {
      try {
        // hasing password
        hashedPassword = await bcrypt.hash(password, saltRounds);

        // adding user to databse
        const user = await new User({
          userName,
          email,
          password: hashedPassword,
        }).save();

        // generating token
        let token = jwt.sign(
          {
            ierName: user.userName,
            emad: user.id,
            usil: user.email,
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        return {
          ...user._doc,
          id: user._id,
          token,
        };
      } catch (err) {
        return new Error("User exist");
      }
    },
  },
};
