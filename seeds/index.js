const Camp = require("../models/camp");
const cities = require("./cities");
const names = require("./seedhelper");

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/my-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Camp.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random25 = Math.floor(Math.random() * 25);
    const random100 = Math.floor(Math.random() * 100);
    const camp = new Camp({
      author: "6721d600fc95f799d82d630a",
      location: `${cities[random25].city}, ${cities[random25].state}`,
      title: `${names[random100]}`,
      // image: `https://picsum.photos/400?random=${Math.random()}`,
      images: [
        {
          url: "https://res.cloudinary.com/donggww4o/image/upload/v1731505373/YelpCamp/y7oaauys1b1o6ifbmc3d.jpg",
          filename: "YelpCamp/ywrgkytkuaweznjcvg5e",
        },
        {
          url: "https://res.cloudinary.com/donggww4o/image/upload/v1730813941/YelpCamp/ptbcm8uqgq6755wp9tuk.jpg",
          filename: "YelpCamp/ptbcm8uqgq6755wp9tuk",
        },
      ],
      description:
        "Nestled deep within the forest, the campground offers a serene escape from the hustle and bustle of daily life. Towering pine trees surround the area, their branches swaying gently in the cool mountain breeze. A babbling brook winds its way through the site, providing a soothing soundtrack to the crackling campfires scattered around the grounds. Tents dot the landscape, while a few rustic cabins stand at the edge of the clearing, offering more sheltered accommodation. At night, the sky comes alive with stars, unpolluted by city lights, while the smell of toasted marshmallows fills the air. Perfect for hikers, families, and anyone seeking a peaceful retreat in nature.",
      geometry: {
        type: "Point",
        coordinates: [cities[random25].longitude, cities[random25].latitude],
      },
      price: 15,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
