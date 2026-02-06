const Timeline = require("../models/timeline-model");
const createError = require("http-errors");
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

// ============================================
// CREATE NEW TIMELINE
// ============================================
const addtimeline = async (req, res, next) => {
  try {
    const { title, description, createdBy, from_year, to_year, celebrityId } = req.body;

    // ✅ Validate required fields
    if (!title || !celebrityId) {
      throw createError(400, "Title and Celebrity ID are required");
    }

    const url = createCleanUrl(title);

    // Handle uploaded media file
    const mainImage = req.files?.["media"]
      ? req.files["media"][0].filename
      : "";

    const now = new Date();
    const createdAt = formatDateDMY(now);

    const newTimeline = new Timeline({
      title: title.trim(),
      description: description?.trim(),
      media: mainImage,
      status: 1,
      createdAt,
      url,
      from_year,
      to_year,
      celebrityId,
      createdBy,
    });

    await newTimeline.save();

    return res.status(201).json({
      success: true,
      message: "Timeline added successfully",
      data: newTimeline,
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE TIMELINE
// ============================================
const updatetimeline = async (req, res, next) => {
  try {
    const { title, description, from_year, to_year } = req.body;
    const timelineId = req.params.id;

    // ✅ Check if timeline exists
    const timeline = await Timeline.findById(timelineId);
    if (!timeline) {
      throw createError(404, "Timeline not found");
    }

    // ✅ Update fields
    if (title) {
      timeline.title = title.trim();
      timeline.url = createCleanUrl(title);
    }
    if (description) timeline.description = description.trim();
    if (from_year) timeline.from_year = from_year;
    if (to_year) timeline.to_year = to_year;

    // ✅ Handle file upload
    const newImageFile = (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      // Delete old image if exists
      if (timeline.media) {
        const oldPath = path.join(__dirname, "../public/timeline/", timeline.media);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      timeline.media = newImageFile.filename;
    }

    await timeline.save();

    return res.status(200).json({
      success: true,
      message: "Timeline updated successfully",
      data: timeline
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE TIMELINE STATUS
// ============================================
const updateStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body;

    // ✅ Validate required fields
    if (!id) {
      throw createError(400, "Timeline ID is required");
    }

    if (status === undefined || status === null) {
      throw createError(400, "Status is required");
    }

    // ✅ Check if timeline exists
    const timeline = await Timeline.findById(id);
    if (!timeline) {
      throw createError(404, "Timeline not found");
    }

    timeline.status = status;
    await timeline.save();

    return res.status(200).json({
      success: true,
      message: "Timeline status updated successfully",
      data: timeline
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ALL TIMELINES BY CELEBRITY
// ============================================
const getdata = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;

    if (!celebrityId) {
      throw createError(400, "Celebrity ID is required");
    }

    const timelines = await Timeline.find({ celebrityId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Timelines retrieved successfully",
      data: timelines
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET TIMELINE BY ID
// ============================================
const gettimelineByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeline = await Timeline.findById(id);

    if (!timeline) {
      throw createError(404, "Timeline not found");
    }

    return res.status(200).json({
      success: true,
      message: "Timeline retrieved successfully",
      data: timeline
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE TIMELINE
// ============================================
const deletetimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeline = await Timeline.findById(id);
    if (!timeline) {
      throw createError(404, "Timeline not found");
    }

    // ✅ Delete associated media file
    if (timeline.media) {
      const mediaPath = path.join(__dirname, "../public/timeline/", timeline.media);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    await Timeline.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Timeline deleted successfully",
      data: { id }
    });

  } catch (error) {
    next(error);
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