const mongoose = require("mongoose");
const mongoURL =
  "mongodb+srv://gofood-admin:gofood@cluster0.18bf7wu.mongodb.net/gofooddb?retryWrites=true&w=majority";

const mongoDB = async () => {
  await mongoose.connect(
    mongoURL,
    { useNewUrlParser: true },
    async (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Database Connected Sucessfully !!");
        const fetched_data = await mongoose.connection.db.collection(
          "food_items"
        );
        fetched_data.find({}).toArray(async function (err, data) {
          const foodCategory = await mongoose.connection.db.collection(
            "foodCategory"
          );
          foodCategory.find({}).toArray(function (err2, catData) {
            if (err2) {
              console.log(err2);
            } else {
              global.foodItems = data;
              global.foodCategory = catData;
            }
          });
        });
      }
    }
  );
};
module.exports = mongoDB;
