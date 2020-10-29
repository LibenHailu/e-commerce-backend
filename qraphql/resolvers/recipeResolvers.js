const checkAuth = require("../../utils/checkAuth");
const Recipe = require("../../model/Recipe");
const { AuthenticationError } = require("apollo-server");

module.exports = {
  Query: {
    getRecipePage: async (_, { pageNum, pageSize }) => {
      try {
        let recipes;
        if (pageNum === 1) {
          recipes = await Recipe.find({})
            .sort({})
            .populate({
              path: "createdBy",
              model: "User",
            })
            .limit(pageSize);
        } else {
          // if page is greater than one figure out how many posts to skip
          const skips = pageSize * (pageNum - 1);
          recipes = await Recipe.find({})
            .sort({})
            .populate({
              path: "createdBy",
              model: "User",
            })
            .skip(skips)
            .limit(pageSize);
        }
        const totalDocs = await Recipe.countDocuments();
        const hasMore = totalDocs > pageSize * pageNum;

        return { recipes, hasMore };
      } catch (err) {
        return new Error(err);
      }
    },
  },
  Mutation: {
    addRecipe: async (
      _,
      { title, image, description, procedures },
      { req }
    ) => {
      try {
        const authUser = await checkAuth(req);
        const recipe = await new Recipe({
          title,
          image,
          description,
          procedures,
          createdBy: authUser.id,
        }).save();

        return recipe;
      } catch (err) {
        return new Error(err);
      }
    },

    updateRecipe: async (
      _,
      { recipeId, title, image, description, procedures },
      { req }
    ) => {
      try {
        const authUser = await checkAuth(req);
        const recipe = await Recipe.findOne({
          _id: recipeId,
          createdBy: authUser.id,
        });
        recipe.title = title;
        recipe.image = image;
        recipe.description = description;
        recipe.procedures = procedures;
        return recipe;
      } catch (err) {
        throw new AuthenticationError("Unauthorized Use");
      }
    },
  },
};
