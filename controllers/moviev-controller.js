const { Movie } = require("../models/moviev-model");
const createHttpError = require("http-errors");
const generateSlug = require("../utils/helper/slugHelper");

const addMovie = async (req, res, next) => {
  try {
    const {
      title,
      releaseYear,
      releaseDate,
      role,
      roleType,
      languages,
      director,
      producer,
      cast,
      genre,
      notes,
      rating,
      platformRating,
      celebrity,
      watchLinks,
      awards,
      sort,
      statusNew,
    } = req.body;

    const createdBy = req.user?.userId || req.body.createdBy;

    // ✅ Fixed: Remove /movies/ prefix
    const profileImage = req.files?.image?.[0]?.filename || null;
    const bgImage = req.files?.imagebg?.[0]?.filename || null;

    const slug = generateSlug({ name: title });

    const existingMovie = await Movie.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingMovie) {
      throw createHttpError(400, "Movie already exists with this title");
    }

    const existingSlug = await Movie.findOne({ slug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    const safeParse = (field) => {
      try {
        return field ? JSON.parse(field) : [];
      } catch {
        return [];
      }
    };

    const parsedLanguages = safeParse(languages);
    const parsedGenre = safeParse(genre);
    const parsedWatchLinks = safeParse(watchLinks);

    const movie = await Movie.create({
      title,
      slug,
      releaseYear,
      releaseDate,
      role,
      roleType,
      languages: parsedLanguages,
      genre: parsedGenre,
      watchLinks: parsedWatchLinks,
      director,
      producer,
      cast,
      notes,
      rating,
      platformRating,
      celebrity,
      image: profileImage, // ✅ Fixed
      imagebg: bgImage,
      createdBy,
      status: 1,
      moderationState: "PENDING", // ✅ Added default moderation state
      awards,
      sort,
      statusNew,
    });

    return res.status(201).json({
      success: true,
      message: "Movie added successfully and sent for review",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const getMovies = async (req, res, next) => {
  try {
    const { page, limit, search, celebrity, moderationState } = req.query;

    let query = { status: 1 }; // ✅ Added status check

    // ✅ By default, only return PUBLISHED movies
    query.moderationState = moderationState || "PUBLISHED";

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (celebrity) {
      query.celebrity = celebrity;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const movies = await Movie.find(query)
      .populate("languages", "name")
      .populate("genre", "name")
      .populate("celebrity", "name")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email") // ✅ Fixed field name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Movie.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      data: movies,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMoviesByCelebrity = async (req, res, next) => {
  try {
    const { celebrity } = req.params;

    const movies = await Movie.find({
      celebrity,
      status: 1,
      // moderationState: "PUBLISHED",
    });

    return res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id)
      .populate("languages", "name")
      .populate("genre", "name")
      .populate("celebrity", "name")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email"); // ✅ Fixed field name

    if (!movie) {
      throw createHttpError(404, "Movie not found");
    }

    return res.status(200).json({
      success: true,
      message: "Movie retrieved successfully",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      releaseYear,
      releaseDate,
      role,
      roleType,
      languages,
      director,
      producer,
      cast,
      notes,
      rating,
      platformRating,
      old_image,
      old_imagebg,
      watchLinks,
      awards,
      genre,
      sort,
      statusNew,
    } = req.body;

    const existingMovie = await Movie.findById(id);
console.log("BODY:", req.body);
console.log("FILES:", req.files);
    if (!existingMovie) {
      throw createHttpError(404, "Movie not found");
    }

    // ✅ Duplicate title check
    if (title && title !== existingMovie.title) {
      const duplicate = await Movie.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicate) {
        throw createHttpError(400, "Movie already exists with this title");
      }
    }

    // ✅ Uploaded files
    const profileImage = req.files?.image?.[0]?.filename || null;
    const bgImage = req.files?.imagebg?.[0]?.filename || null;

    console.log("FILES:", req.files);
    console.log("profileImage:", profileImage);
    console.log("bgImage:", bgImage);

    // ✅ Parse arrays
    let parsedLanguages = [];
    let parsedGenre = [];
    let parsedWatchLinks = [];

    try {
      parsedLanguages =
        typeof languages === "string"
          ? JSON.parse(languages)
          : Array.isArray(languages)
          ? languages
          : [];
    } catch {
      parsedLanguages = [];
    }

    try {
      parsedGenre =
        typeof genre === "string"
          ? JSON.parse(genre)
          : Array.isArray(genre)
          ? genre
          : [];
    } catch {
      parsedGenre = [];
    }

    try {
      parsedWatchLinks =
        typeof watchLinks === "string"
          ? JSON.parse(watchLinks)
          : Array.isArray(watchLinks)
          ? watchLinks
          : [];
    } catch {
      parsedWatchLinks = [];
    }

    // ✅ Slug update
    let slug = existingMovie.slug;

    if (title && title !== existingMovie.title) {
      slug = generateSlug({ name: title });

      const slugConflict = await Movie.findOne({
        slug,
        _id: { $ne: id },
      });

      if (slugConflict) {
        throw createHttpError(409, "Slug already exists");
      }
    }

    // ✅ Update Data
    const updateData = {
      title,
      slug,
      releaseYear,
      releaseDate,
      role,
      roleType,
      languages: parsedLanguages,
      director,
      producer,
      cast,
      notes,
      genre: parsedGenre,
      rating,
      platformRating,
      awards,
      sort,
      statusNew,
      watchLinks: parsedWatchLinks,
    };

    // ✅ Poster Image
    if (profileImage) {
      updateData.image = profileImage;
    } else {
      updateData.image = old_image || existingMovie.image;
    }

    // ✅ Background Image
    if (bgImage) {
      updateData.imagebg = bgImage;
    } else {
      updateData.imagebg = old_imagebg || existingMovie.imagebg;
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingMovie = await Movie.findById(id);

    if (!existingMovie) {
      throw createHttpError(404, "Movie not found");
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedMovie,
    });

  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      throw createHttpError(404, "Movie not found");
    }

    // ✅ Soft delete
    await Movie.findByIdAndUpdate(id, { status: 0 });

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
const updateMovieFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    // Movie exists check
    const existingMovie = await Movie.findById(id);

    if (!existingMovie) {
      return res.status(404).json({
        success: false,
        msg: "Movie not found",
      });
    }

    // ===== LIMIT CHECK =====
    // Only when turning featured ON
    if (featured == 1) {

      // Count already featured movies
      const featuredCount = await Movie.countDocuments({
        featured: 1,
        _id: { $ne: id }, // exclude current movie
      });

      // Allow only 3
      if (featuredCount >= 3) {
        return res.status(400).json({
          success: false,
          msg: "Only 3 movies can be featured",
        });
      }
    }

    // Update movie
    const movie = await Movie.findByIdAndUpdate(
      id,
      { featured },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Featured updated successfully",
      data: movie,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};
module.exports = {
  addMovie,
  getMovies,
  getMoviesByCelebrity,
  getMovieById,
  updateMovie,
  updateStatus,
  deleteMovie,
  updateMovieFeatured,
};
