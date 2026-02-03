const Testimonial = require("../models/testimonial-model");
const fs = require("fs");
const path = require("path");
// Utility: Create clean URL from title
function createCleanUrl(title) {
  let cleanTitle = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
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

// Create new testimonial
const addtestimonial = async (req, res) => {
  try {
const { name,createdBy,designation, feedback} = req.body;
    const url = createCleanUrl(req.body.name);

   

    // Handle uploaded files
    const mainImage = req.files["image"]
      ? req.files["image"][0].filename
      : "";
    const now = new Date(); // ✅ Define now
    const createdAt = formatDateDMY(now); // 👈 formatted date
    const newBlog = new Testimonial({
      name,

       designation,
          feedback,
      image: mainImage,
       status: 1, // default active
       createdAt, // ✅ Define now
       url,
       createdBy
    });

    await newBlog.save();

    res.json({
      msg: "Testimonial added successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Add Testimonial Error:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

const updatetestimonial = async (req, res) => {
  try {
    const { name,designation,feedback } = req.body;
    const blogId = req.params.id;

    const testimonial = await Testimonial.findById(blogId);
    if (!testimonial) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    // Update fields
    testimonial.name = name || testimonial.name;
    
  // Update fields
    testimonial.designation = designation || testimonial.designation;
        testimonial.feedback = feedback || testimonial.feedback;

    // 📂 Image upload handling
    if (req.files) {
      // If main_image uploaded
      if (req.files.image) {
        // delete old image if exists
        if (testimonial.image) {
          const oldMainPath = path.join(__dirname, "../public/testimonial/", testimonial.image);
          if (fs.existsSync(oldMainPath)) fs.unlinkSync(oldMainPath);
        }
        testimonial.image = req.files.image[0].filename;
      }

    
    }

    await testimonial.save();
    res.status(200).json({ msg: "Blog updated successfully", testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    await Testimonial.updateOne({ _id: id }, { $set: { status } }, { new: true });

    res.status(200).json({ msg: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update testimonial



// Get all testimonials
const getdata = async (req, res) => {
  try {
    const response = await Testimonial.find();
    if (!response || response.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete testimonial
const deletetestimonial = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Testimonial.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// ✅ Corrected Controller
const gettestimonialsByid = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne({ _id: req.params.id });

    if (!testimonial) {
      return res.status(404).json({ msg: "No data found" });
    }

    // ✅ Return the fetched document
    res.status(200).json({ msg: testimonial });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};


// Export all
module.exports = {
  addtestimonial,
  updateStatus,
  updatetestimonial,
  getdata,
  deletetestimonial,
  gettestimonialsByid,
};
