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
    const galleryImages = req.files?.gallery
      ? req.files.gallery.map((file) => file.filename)
      : [];

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
      gallery: galleryImages, // ✅ Fixed
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
    })
     

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
      old_gallery, // ✅ Added for gallery
      watchLinks,
      awards,
      genre,
      sort,
      statusNew,
    } = req.body;

    const existingMovie = await Movie.findById(id);
    if (!existingMovie) {
      throw createHttpError(404, "Movie not found");
    }

    if (title && title !== existingMovie.title) {
      const duplicate = await Movie.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicate) {
        throw createHttpError(400, "Movie already exists with this title");
      }
    }

    // ✅ Image handling
    const profileImage = req.files?.image?.[0]?.filename || null;
    
    // ✅ Gallery handling
    const galleryImages = req.files?.gallery
      ? req.files.gallery.map((file) => file.filename)
      : null;

    let parsedLanguages = [];
    try {
      if (typeof languages === "string") parsedLanguages = JSON.parse(languages);
      else if (Array.isArray(languages)) parsedLanguages = languages;
    } catch {
      parsedLanguages = [];
    }

    let parsedGenre = [];
    try {
      if (typeof genre === "string") parsedGenre = JSON.parse(genre);
      else if (Array.isArray(genre)) parsedGenre = genre;
    } catch {
      parsedGenre = [];
    }

    let parsedWatchLinks = [];
    try {
      if (typeof watchLinks === "string") {
        if (watchLinks.trim().startsWith("[") && watchLinks.trim().endsWith("]")) {
          parsedWatchLinks = JSON.parse(watchLinks);
        }
      } else if (Array.isArray(watchLinks)) {
        parsedWatchLinks = watchLinks;
      } else if (watchLinks && typeof watchLinks === "object") {
        parsedWatchLinks = [watchLinks];
      }
    } catch (err) {
      parsedWatchLinks = [];
    }

    parsedWatchLinks = parsedWatchLinks.filter(
      (wl) => wl && typeof wl === "object" && !Array.isArray(wl)
    );

    // ✅ Gallery parsing
    let parsedOldGallery = [];
    try {
      if (typeof old_gallery === "string") {
        parsedOldGallery = JSON.parse(old_gallery);
      } else if (Array.isArray(old_gallery)) {
        parsedOldGallery = old_gallery;
      }
    } catch {
      parsedOldGallery = [];
    }

    let slug = existingMovie.slug;
    if (title && title !== existingMovie.title) {
      slug = generateSlug({ name: title });

      const slugConflict = await Movie.findOne({
        slug: slug,
        _id: { $ne: id },
      });

      if (slugConflict) {
        throw createHttpError(409, "Generated slug already exists");
      }
    }

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

    // ✅ Image update logic
    if (profileImage) {
      updateData.image = profileImage;
    } else if (old_image) {
      updateData.image = old_image;
    }

    // ✅ Gallery update logic
    if (galleryImages && galleryImages.length > 0) {
      updateData.gallery = [...parsedOldGallery, ...galleryImages];
    } else if (parsedOldGallery.length > 0) {
      updateData.gallery = parsedOldGallery;
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
    const { id, status } = req.body;

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

module.exports = {
  addMovie,
  getMovies,
  getMoviesByCelebrity,
  getMovieById,
  updateMovie,
  updateStatus,
  deleteMovie,
};