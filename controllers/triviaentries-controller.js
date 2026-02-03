const { Triviaentries } = require("../models/triviaentries-model");
const { TriviaTypes } = require("../models/triviatypes-model");

const path = require("path");
const fs = require("fs");

// ✅ Create clean SEO URL from title
function createCleanUrl(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ✅ Format date to DD-MM-YYYY HH:mm:ss
function formatDateDMY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// ✅ Add Trivia Entry
const addtriviaentries = async (req, res) => {
  try {
    const { category_id, category_name, title, description, source_link, createdBy,celebrityId } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ msg: "Title and Category are required" });
    }

    const mediaFile = req.files?.media ? req.files.media[0].filename : "";
    const url = createCleanUrl(title);
    const createdAt = formatDateDMY(new Date());

    const newEntry = new Triviaentries({
      title,
      description,
      category_id,
      category_name,
      media: mediaFile,
      source_link,
      createdBy,
      url,
      createdAt,
        celebrityId, // movie belongs to this celebrity
      status: 1,
    });

    await newEntry.save();
    res.status(200).json({ success: true, msg: "Trivia Entry added successfully", triviaentries: newEntry });
  } catch (error) {
    console.error("Add Trivia Entry Error:", error);
    res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// ✅ Get category dropdown options
const categoryOptions = async (req, res) => {
  try {
    const categories = await TriviaTypes.find({ status: 1 });
    if (!categories.length) return res.status(404).json({ msg: "No categories found" });
    res.status(200).json({ msg: categories });
  } catch (error) {
    console.error("Category Fetch Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get all trivia entries
const getdatatriviaentries = async (req, res) => {
  try {
     const { celebrityId } = req.params;
    const data = await Triviaentries.find({ celebrityId });
    if (!data.length) return res.status(404).json({ msg: "No entries found" });
    res.status(200).json({ msg: data });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get Trivia Entry by ID
const gettriviaentriesByid = async (req, res) => {
  try {
    const entry = await Triviaentries.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: "No entry found" });
    res.status(200).json({ msg: entry });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Update Trivia Entry
const updatetriviaentries = async (req, res) => {
  try {
    const { category_id, category_name, title, description, source_link, updatedBy } = req.body;
    const entry = await Triviaentries.findById(req.params.id);

    if (!entry) return res.status(404).json({ msg: "Entry not found" });

    // Update text fields
    entry.category_id = category_id || entry.category_id;
    entry.category_name = category_name || entry.category_name;
    entry.title = title || entry.title;
    entry.description = description || entry.description;
    entry.source_link = source_link || entry.source_link;
    entry.updatedBy = updatedBy || entry.updatedBy;

    // ✅ If new media uploaded
    if (req.files?.media) {
      if (entry.media) {
        const oldPath = path.join(__dirname, "../public/triviaentries/", entry.media);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      entry.media = req.files.media[0].filename;
    }

    await entry.save();
    res.status(200).json({ success: true, msg: "Trivia Entry updated successfully", triviaentries: entry });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Update status (active/inactive)
const updateStatustriviaentries = async (req, res) => {
  try {
    const { status, id } = req.body;
    await Triviaentries.updateOne({ _id: id }, { $set: { status } });
    res.status(200).json({ msg: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Delete Trivia Entry
const deletetriviaentries = async (req, res) => {
  try {
    const entry = await Triviaentries.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ msg: "Entry not found" });

    // delete media file
    if (entry.media) {
      const filePath = path.join(__dirname, "../public/triviaentries/", entry.media);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ msg: "Entry deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addtriviaentries,
  categoryOptions,
  getdatatriviaentries,
  gettriviaentriesByid,
  updatetriviaentries,
  updateStatustriviaentries,
  deletetriviaentries,
};
