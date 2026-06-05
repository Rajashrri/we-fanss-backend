const Collection = require("../models/collection-model");
const Follow = require("../models/follow-model");
const RecentView = require("../models/recentview-model");
const { Celebraty } = require("../models/celebraty-model");
const Userlogin = require("../models/userlogin-model");


const fs = require("fs");
const path = require("path");
// ----------------------------------user dashboard ----------------------------------------------------

const getSavedCelebrityCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const collections = await Collection.find({ userId });

    let totalSaved = 0;

    collections.forEach((collection) => {
      totalSaved += collection.celebrities.length;
    });

    res.status(200).json({
      success: true,
      totalSaved,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const getFollowedCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Follow.countDocuments({
      userId,
    });

    res.status(200).json({
      success: true,
      totalFollowed: count,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const getFollowedCelebrities = async (req, res) => {
  try {
    const { userId } = req.params;

    // latest 6 followed
    const follows = await Follow.find({ userId })
      .sort({ createdAt: -1 })
      .limit(6);

    // celebrity ids
    const celebrityIds = follows.map(
      (item) => item.celebrityId
    );

const celebrities = await Celebraty.find({
  _id: { $in: celebrityIds },
})
.populate({
  path: "professionalIdentity.professions",
  select: "name slug",
})
.populate({
  path: "professionalIdentity.primaryProfession",
  select: "name slug",
});
    res.status(200).json({
      success: true,
      data: celebrities,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const getFollowedCelebritiesall = async (req, res) => {
  try {

    const { userId } = req.params;

    // all follows latest first
    const follows = await Follow.find({ userId })
      .sort({ createdAt: -1 });

    // ids
    const celebrityIds = follows.map(
      (item) => item.celebrityId
    );

    // get celebrities
const celebrities = await Celebraty.find({
  _id: { $in: celebrityIds },
})
.populate({
  path: "professionalIdentity.professions",
  select: "name slug",
})
.populate({
  path: "professionalIdentity.primaryProfession",
  select: "name slug",
});
    // maintain same order
    const orderedCelebrities = celebrityIds.map((id) =>
      celebrities.find(
        (c) => c._id.toString() === id.toString()
      )
    );

    res.status(200).json({
      success: true,
      data: orderedCelebrities,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};


//recent view


// ================= ADD RECENT VIEW =================

const addRecentView = async (req, res) => {

  try {

    const { userId, celebrityId } = req.body;

    // already viewed?
    const existing = await RecentView.findOne({
      userId,
      celebrityId,
    });

    // agar already hai to latest bana do
    if (existing) {

      existing.updatedAt = new Date();

      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Updated",
      });
    }

    // new save
    await RecentView.create({
      userId,
      celebrityId,
    });

    res.status(200).json({
      success: true,
      message: "Recent View Saved",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getRecentViews = async (req, res) => {

  try {

    const { userId } = req.params;

    const recent = await RecentView.find({
      userId,
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    const celebrityIds = recent.map(
      (item) => item.celebrityId
    );

    const celebrities = await Celebraty.find({
      _id: { $in: celebrityIds },
    });

    res.status(200).json({
      success: true,
      data: celebrities,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getCollectionsHome = async (
  req,
  res
) => {
  try {

    const { userId } = req.params;

    const collections =
      await Collection.find({
        userId,
      })
        .sort({ createdAt: -1 })
        .limit(6);

    res.status(200).json({
      success: true,
      data: collections,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getUserCollections =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const collections =
        await Collection.find({
          userId,
        }).sort({
          createdAt: -1,
        });

      res.json({
        success: true,
        data: collections,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };


  const getCollectionDetails = async (
  req,
  res
) => {
  try {
    const { slug } = req.params;

    const collection =
      await Collection.findOne({ slug })
        .populate("celebrities");

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Userlogin.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, mobile } = req.body;

    const user = await Userlogin.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;

    // New Profile Image
    if (
      req.files &&
      req.files.profileImage &&
      req.files.profileImage.length > 0
    ) {
      // Delete old image
      if (user.profileImage) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          user.profileImage.replace("/userprofile/", "userprofile/")
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image
      user.profileImage = `/userprofile/${req.files.profileImage[0].filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {

getSavedCelebrityCount,
  getFollowedCount,
    getFollowedCelebrities,
  getFollowedCelebritiesall,
  addRecentView,
  getRecentViews,
  getCollectionsHome,
  getUserCollections,
  getCollectionDetails,
   updateProfile,
getProfile

};