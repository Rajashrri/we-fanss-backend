const Collection = require("../models/collection-model");


// ================= CREATE COLLECTION =================

const createCollection = async (req, res) => {
  try {
    const {
      userId,
      name,
      celebrityId,
    } = req.body;

    // slug generate
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-") // spaces -> -
      .replace(/[^\w-]+/g, ""); // remove special chars

    // already exists?
    const existing = await Collection.findOne({
      userId,
      name,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Collection already exists",
      });
    }

    const collection = await Collection.create({
      userId,
      name,
      slug,
      celebrities: celebrityId
        ? [celebrityId]
        : [],
    });

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

// ================= GET USER COLLECTIONS =================

const getUserCollections = async (req, res) => {

  try {

    const { userId } = req.params;

    const collections = await Collection.find({
      userId,
    }).sort({ createdAt: -1 });

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


// ================= SAVE TO COLLECTION =================

const saveToCollection = async (req, res) => {

  try {

    const {
      collectionId,
      celebrityId,
    } = req.body;

    const collection = await Collection.findById(
      collectionId
    );

    if (!collection) {

      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    // already added
    if (
      collection.celebrities.includes(
        celebrityId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Celebrity already saved",
      });
    }

    collection.celebrities.push(
      celebrityId
    );

    await collection.save();

    res.status(200).json({
      success: true,
      message:
        "Saved to collection",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createCollection,
  getUserCollections,
  saveToCollection,
};