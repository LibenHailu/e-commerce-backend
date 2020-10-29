const userResolvers = require("./userResolvers");
const recipeResolvers = require("./recipeResolvers");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...recipeResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...recipeResolvers.Mutation,
  },
};
