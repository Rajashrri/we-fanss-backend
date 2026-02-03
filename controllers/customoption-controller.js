const CustomOption = require("../models/customoption-model");
const fs = require("fs");
const path = require("path");
// Utility: Create clean URL from title
function createCleanUrl(title) {
  let cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return cleanTitle;
}

// Utility: Format date as dd-mm-yyyy hh:mm:ss
const formatDateDMY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// Create new customoption
const addcustomoption = async (req, res) => {
  try {
    const { title, description, createdBy, celebrityId } =
      req.body;
    const url = createCleanUrl(req.body.title);

    // Handle uploaded media file
    const mainImage = req.files?.["media"]
      ? req.files["media"][0].filename
      : "";

    const now = new Date();
    const createdAt = formatDateDMY(now);

    const newCustomOption = new CustomOption({
      title,
      description,
      media: mainImage,
      status: 1, // default active
      createdAt,
      url,
    
      celebrityId, // movie belongs to this celebrity
      createdBy,
    });

    await newCustomOption.save();

    // ✅ Include success flag
    return res.json({
      success: true,
      msg: "CustomOption added successfully",
      data: newCustomOption,
    });
  } catch (error) {
    console.error("Add CustomOption Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

const updatecustomoption = async (req, res) => {
  try {
    const { title, description} = req.body;
    const customoptionId = req.params.id;

    const customoption = await CustomOption.findById(customoptionId);
    if (!customoption) {
      return res.status(404).json({ msg: "CustomOption not found" });
    }

    // ✅ Update name
    if (title) customoption.title = title;
    if (description) customoption.description = description;
   

    // ✅ Handle file upload
    const newImageFile =
      (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      // delete old image if exists
      if (customoption.media) {
        const oldPath = path.join(
          __dirname,
          "../public/customoption/",
          customoption.media
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      customoption.media = newImageFile.filename;
    }

    await customoption.save();

    res.status(200).json({ msg: "CustomOption updated successfully", customoption });
  } catch (error) {
    console.error("Error updating CustomOption:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    await CustomOption.updateOne({ _id: id }, { $set: { status } }, { new: true });

    res.status(200).json({ msg: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update customoption

// Get all customoptions
const getdata = async (req, res) => {
  try {
     const { celebrityId } = req.params;
    const response = await CustomOption.find({ celebrityId });
    if (!response || response.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete customoption
const deletecustomoption = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await CustomOption.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: "CustomOption deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get customoption by ID
const getcustomoptionByid = async (req, res) => {
  try {
    const customoption = await CustomOption.findOne({ _id: req.params.id });

    if (!customoption) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: customoption });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Export all
module.exports = {
  addcustomoption,
  updateStatus,
  updatecustomoption,
  getdata,
  deletecustomoption,
  getcustomoptionByid,
};
