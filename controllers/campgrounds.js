const Camp = require("../models/camp");
const { cloudinary } = require("../cloudinary");
const mapGeocoding = require("@maptiler/client");
mapGeocoding.config.apiKey = process.env.MAPTILER_KEY;

module.exports.index = async (req, res) => {
  const camps = await Camp.find({}).populate('popupText', null, null, { strictPopulate: false });
  res.render("campgrounds/index", { camps });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};
module.exports.createCampground = async (req, res, next) => {
  const campground = new Camp(req.body.campground);
  const geoData = await mapGeocoding.geocoding.forward(campground.location, {
    limit: 1,
  });
  campground.geometry = geoData.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  //console.log(campground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.showCampground = async (req, res) => {
  const camp = await Camp.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // console.log(camp);
  res.render("campgrounds/show", { camp });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Camp.findById(id);
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  
  const campground = await Camp.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const geoData = await mapGeocoding.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  campground.geometry = geoData.features[0].geometry;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Camp.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
