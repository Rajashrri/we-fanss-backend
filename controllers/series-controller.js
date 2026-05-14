const { Series } = require("../models/series-model");
const { Language } = require("../models/language-model");
const { GenreMaster } = require("../models/genremaster-model");

function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

  return cleanTitle;
}

//add project
const languageOptions = async (req, res) => {
  try {
    const item = await Language.find({ status: 1 }).sort({ name: 1 });
    if (!item) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({
      msg: item,
    });
  } catch (error) {
    console.log(`Language ${error}`);
  }
};

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
// ✅ Get category dropdown options
const GenreMasterOptions = async (req, res) => {
  try {
    const categories = await GenreMaster.find({ status: 1 });
    if (!categories.length)
      return res.status(404).json({ msg: "No categories found" });
    res.status(200).json({ msg: categories });
  } catch (error) {
    console.error("Category Fetch Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const addSeries = async (req, res) => {
  try {
    const {
      title,
      type,
      platform,
      role,
      role_type,
      languages,
      director,
      start_year,
      end_year,
      notes,
      statusseries,
      genre, // ✅ now parsed as array
      celebrityId,
      createdBy,
      watchLinks,
      seasons,
      sort,
      statusnew,
    } = req.body;

    // Single poster/thumbnail
    const profileImage = req.files?.image?.[0]?.filename || null;

    const bgImage = req.files?.imagebg?.[0]?.filename || null;

    const now = new Date();
    const createdAt = formatDateDMY(now);

    // Duplicate title check
    const existingSeries = await Series.findOne({ title });
    if (existingSeries) {
      return res
        .status(400)
        .json({ status: false, msg: "Series already exists with this title" });
    }

    // SEO-friendly URL
    const url = createCleanUrl(title);

    // Parse JSON fields safely
    let parsedLanguages = [];
    try {
      parsedLanguages = languages ? JSON.parse(languages) : [];
    } catch {
      parsedLanguages = Array.isArray(languages) ? languages : [];
    }

    let parsedSeasons = [];
    try {
      parsedSeasons = seasons ? JSON.parse(seasons) : [];
    } catch (err) {
      console.error("Invalid seasons JSON:", err);
    }

    let parsedWatchLinks = [];
    try {
      parsedWatchLinks = watchLinks ? JSON.parse(watchLinks) : [];
    } catch (err) {
      console.error("Invalid watchLinks JSON:", err);
    }

    // ✅ Parse genre as array
    let parsedGenre = [];
    try {
      parsedGenre = genre ? JSON.parse(genre) : [];
    } catch {
      parsedGenre = Array.isArray(genre) ? genre : [];
    }

    // Create new series document
    const newSeries = await Series.create({
      title,
      type,
      platform,
      role,
      role_type,
      languages: parsedLanguages,
      director,
      notes,
      start_year,
      end_year,
      genre: parsedGenre, // ✅ save as array
      celebrityId,
      image: profileImage,
      imagebg: bgImage,
      watchLinks: parsedWatchLinks,
      seasons: parsedSeasons,
      createdBy,
      createdAt,
      status: "1",
      statusseries,
      sort,
      statusnew,
      url,
    });

    return res.status(201).json({
      success: true,
      message: "Series added successfully",
      data: newSeries,
    });
  } catch (error) {
    console.error("Add Series Error:", error);
    res
      .status(500)
      .json({ status: false, msg: "Internal Server Error", error });
  }
};

//update status

const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await Series.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
      },
      {
        new: true,
      },
    );
    res.status(201).json({
      msg: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateSeries = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      type,
      start_year,
      role,
      role_type,
      languages,
      director,
      end_year,
      platform,
      notes,
      old_image,
            old_imagebg,

      watchLinks,
      seasons,
      statusseries,
      sort,
      genre,
      statusnew,
    } = req.body;

    console.log("🧩 Received watchLinks:", watchLinks);
    console.log("🧩 Type of watchLinks:", typeof watchLinks);

    const profileImage = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;
    const bgImage = req.files?.imagebg?.[0]?.filename || null;

    // ✅ Parse languages safely
    let parsedLanguages = [];
    try {
      if (typeof languages === "string") {
        parsedLanguages = JSON.parse(languages);
      } else if (Array.isArray(languages)) {
        parsedLanguages = languages;
      }
    } catch {
      parsedLanguages = [];
    }

    // ✅ Parse watchLinks safely
    let parsedWatchLinks = [];
    try {
      if (typeof watchLinks === "string") {
        if (
          watchLinks.trim().startsWith("[") &&
          watchLinks.trim().endsWith("]")
        ) {
          parsedWatchLinks = JSON.parse(watchLinks);
        } else {
          parsedWatchLinks = [];
        }
      } else if (Array.isArray(watchLinks)) {
        parsedWatchLinks = watchLinks;
      } else if (watchLinks && typeof watchLinks === "object") {
        parsedWatchLinks = [watchLinks];
      }
    } catch (err) {
      console.error("Invalid watchLinks JSON:", err);
      parsedWatchLinks = [];
    }

    // ✅ Sanitize each element
    parsedWatchLinks = parsedWatchLinks.filter(
      (wl) => wl && typeof wl === "object" && !Array.isArray(wl),
    );

    // ✅ Parse genre safely
    let parsedGenre = [];
    try {
      if (typeof genre === "string") {
        if (genre.trim().startsWith("[") && genre.trim().endsWith("]")) {
          parsedGenre = JSON.parse(genre);
        } else {
          parsedGenre = [];
        }
      } else if (Array.isArray(genre)) {
        parsedGenre = genre;
      } else if (genre && typeof genre === "object") {
        parsedGenre = [genre];
      }
    } catch (err) {
      console.error("Invalid genre JSON:", err);
      parsedGenre = [];
    }

    // ✅ Parse watchLinks safely
    let parsedseasons = [];
    try {
      if (typeof seasons === "string") {
        if (seasons.trim().startsWith("[") && seasons.trim().endsWith("]")) {
          parsedseasons = JSON.parse(seasons);
        } else {
          parsedseasons = [];
        }
      } else if (Array.isArray(seasons)) {
        parsedseasons = seasons;
      } else if (seasons && typeof seasons === "object") {
        parsedseasons = [seasons];
      }
    } catch (err) {
      console.error("Invalid seasons JSON:", err);
      parsedseasons = [];
    }

    // ✅ Sanitize each element
    parsedseasons = parsedseasons.filter(
      (wl) => wl && typeof wl === "object" && !Array.isArray(wl),
    );

    const updateData = {
      title,
      type,
      start_year,
      role,
      role_type,
      languages: parsedLanguages,
      director,
      end_year,
      platform,
      genre: parsedGenre, // ✅ use parsedGenre here
      notes,
      statusseries,
      sort,
      statusnew,
      watchLinks: parsedWatchLinks,
      seasons: parsedseasons,
      updatedAt: new Date(),
    };

    if (profileImage) updateData.image = profileImage;
    else if (old_image) updateData.image = old_image;


    if (bgImage) updateData.imagebg = bgImage;
    else if (old_imagebg) updateData.imagebg = old_imagebg;

 
    const result = await Series.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({ status: false, msg: "Series not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Series updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Series Error:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
};

//get table data

const getSeriesByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;
    const series = await Series.find({ celebrityId });
    res.json({ status: true, msg: series });
  } catch (error) {
    console.error("Get Series Error:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

//delete

const deleteseries = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Series.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({
        status: false,
        msg: "No Data Found",
      });
    }

    return res.status(200).json({
      status: true,
      msg: "Celebrity deleted successfully",
      data: response,
    });
  } catch (error) {
    console.error("Delete Series error:", error);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

//for edit

// backend: controller
const getseriesByid = async (req, res) => {
  try {
    const project = await Series.findOne({ _id: req.params.id });

    if (!project) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    res.status(200).json({ msg: project }); // msg is an object
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addSeries,
  languageOptions,
  updateStatus,
  updateSeries,
  getSeriesByCelebrity,
  deleteseries,
  getseriesByid,
  GenreMasterOptions,
};
