const Timeline = require("../models/timeline-model");
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

// Create new timeline
const addtimeline = async (req, res) => {
  try {
    const { title, description, createdBy, from_year, to_year, celebrityId } =
      req.body;
    const url = createCleanUrl(req.body.title);

    // Handle uploaded media file
    const mainImage = req.files?.["media"]
      ? req.files["media"][0].filename
      : "";

    const now = new Date();
    const createdAt = formatDateDMY(now);

    const newTimeline = new Timeline({
      title,
      description,
      media: mainImage,
      status: 1, // default active
      createdAt,
      url,
      from_year,
      to_year,
      celebrityId, // movie belongs to this celebrity
      createdBy,
    });

    await newTimeline.save();

    // ✅ Include success flag
    return res.json({
      success: true,
      msg: "Timeline added successfully",
      data: newTimeline,
    });
  } catch (error) {
    console.error("Add Timeline Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

const updatetimeline = async (req, res) => {
  try {
    const { title, description, from_year, to_year } = req.body;
    const timelineId = req.params.id;

    const timeline = await Timeline.findById(timelineId);
    if (!timeline) {
      return res.status(404).json({ msg: "Timeline not found" });
    }

    // ✅ Update name
    if (title) timeline.title = title;
    if (description) timeline.description = description;
    if (from_year) timeline.from_year = from_year;
    if (to_year) timeline.to_year = to_year;

    // ✅ Handle file upload
    const newImageFile =
      (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      // delete old image if exists
      if (timeline.media) {
        const oldPath = path.join(
          __dirname,
          "../public/timeline/",
          timeline.media
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      timeline.media = newImageFile.filename;
    }

    await timeline.save();

    res.status(200).json({ msg: "Timeline updated successfully", timeline });
  } catch (error) {
    console.error("Error updating Timeline:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    await Timeline.updateOne({ _id: id }, { $set: { status } }, { new: true });

    res.status(200).json({ msg: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update timeline

// Get all timelines
const getdata = async (req, res) => {
  try {
     const { celebrityId } = req.params;
    const response = await Timeline.find({ celebrityId });
    if (!response || response.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete timeline
const deletetimeline = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Timeline.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: "timeline deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get timeline by ID
const gettimelineByid = async (req, res) => {
  try {
    const timeline = await Timeline.findOne({ _id: req.params.id });

    if (!timeline) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: timeline });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Export all
module.exports = {
  addtimeline,
  updateStatus,
  updatetimeline,
  getdata,
  deletetimeline,
  gettimelineByid,
};
