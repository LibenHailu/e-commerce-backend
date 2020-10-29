const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");
require("dotenv").config();

module.exports = async (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = await jwt.verify(token, process.env.SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new AuthenticationError(
      "Authorization token must be 'Bearer [token]"
    );
  }
  throw new AuthenticationError("Authorization header must be provided");
};
