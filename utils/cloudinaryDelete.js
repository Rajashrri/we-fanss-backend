const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFromCloudinary = async (filePath) => {
  try {
    if (!filePath) return false;

    let publicId = "";

    // If full Cloudinary URL
    if (filePath.includes("res.cloudinary.com")) {
      const urlParts = filePath.split("/upload/")[1];

      if (!urlParts) return false;

      // remove version number if exists
      const pathWithoutVersion = urlParts.replace(/^v\d+\//, "");

      // remove extension
      publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");
    } else {
      // already public id
      publicId = filePath.replace(/\.[^/.]+$/, "");
    }

    console.log("Deleting Cloudinary Public ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    console.log("Cloudinary Delete Result:", result);

    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
};

module.exports = deleteFromCloudinary;