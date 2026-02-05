const CustomOption = require("../models/customoption-model");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");
const createError = require("http-errors");

const addcustomoption = async (req, res, next) => {
  try {
    const { title, description, celebrity } = req.body;
    
    const slug = generateSlug({ name: title });

    // Check if already exists
    const existingOption = await CustomOption.findOne({
      $or: [
        { title: title.trim() },
        { slug: slug }
      ],
    });

    if (existingOption) {
      throw createError(409, "Custom option already exists with this title or slug");
    }

    const mediaFile = req.files?.["media"] ? req.files["media"][0] : null;
    
    let mediaData = undefined;
    if (mediaFile) {
      // Determine media type from mimetype
      const mediaType = mediaFile.mimetype.startsWith('video/') ? 'video' : 'image';
      
      mediaData = {
        path: `/custom-section/${mediaFile.filename}`,
        type: mediaType
      };
    }

    const newCustomOption = new CustomOption({
      title: title.trim(),
      slug,
      description,
      media: mediaData,
      celebrity,
      createdBy: req.user.userId,
    });

    await newCustomOption.save();

    return res.status(201).json({
      success: true,
      message: "Custom option created successfully",
      data: newCustomOption,
    });
  } catch (error) {
    next(error);
  }
};

const updatecustomoption = async (req, res, next) => {
  try {
    const { title, description, celebrity, status } = req.body;
    const customoptionId = req.params.id;

    const customoption = await CustomOption.findById(customoptionId);
    if (!customoption) {
      throw createError(404, "Custom option not found");
    }

    // Check for duplicates if title is being updated
    if (title) {
      const newSlug = generateSlug({ name: title });
      
      const duplicate = await CustomOption.findOne({
        $and: [
          { _id: { $ne: customoptionId } },
          {
            $or: [
              { title: title.trim() },
              { slug: newSlug },
            ],
          },
        ],
      });

      if (duplicate) {
        throw createError(409, "Custom option with this title or slug already exists");
      }

      customoption.title = title.trim();
      customoption.slug = newSlug;
    }

    if (description !== undefined) customoption.description = description;
    if (celebrity !== undefined) customoption.celebrity = celebrity;
    if (status !== undefined) customoption.status = status;

    const newImageFile = (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      if (customoption.media && customoption.media.path) {
        const oldImageName = path.basename(customoption.media.path);
        const oldPath = path.join(__dirname, "../public/custom-section/", oldImageName);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("🗑️ Old media deleted");
          } catch (err) {
            console.error("❌ Failed to delete old media:", err);
          }
        }
      }

      // Determine media type from mimetype
      const mediaType = newImageFile.mimetype.startsWith('video/') ? 'video' : 'image';

      customoption.media = {
        path: `/custom-section/${newImageFile.filename}`,
        type: mediaType
      };
    }

    await customoption.save();

    res.status(200).json({ 
      success: true,
      message: "Custom option updated successfully", 
      data: customoption 
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body;

    if (!id) {
      throw createError(400, "Custom option ID is required");
    }

    if (status === undefined || status === null) {
      throw createError(400, "Status is required");
    }

    if (![0, 1].includes(status)) {
      throw createError(400, "Status must be either 0 (inactive) or 1 (active)");
    }

    const customoption = await CustomOption.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!customoption) {
      throw createError(404, "Custom option not found");
    }

    res.status(200).json({ 
      success: true,
      message: "Status updated successfully",
      data: {
        customOptionId: customoption._id.toString(),
        status: customoption.status,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getdata = async (req, res, next) => {
  try {
    const { celebrity } = req.params;
    const response = await CustomOption.find({ celebrity })
      .populate('celebrity', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true,
      message: "Data retrieved successfully",
      data: response,
      meta: {
        count: response.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deletecustomoption = async (req, res, next) => {
  try {
    const id = req.params.id;
    const customoption = await CustomOption.findByIdAndDelete(id);

    if (!customoption) {
      throw createError(404, "Custom option not found");
    }

    // Delete media if exists
    if (customoption.media && customoption.media.path) {
      const mediaName = path.basename(customoption.media.path);
      const mediaPath = path.join(__dirname, "../public/custom-section/", mediaName);
      if (fs.existsSync(mediaPath)) {
        try {
          fs.unlinkSync(mediaPath);
          console.log("🗑️ Media deleted");
        } catch (err) {
          console.error("❌ Failed to delete media:", err);
        }
      }
    }

    res.status(200).json({ 
      success: true,
      message: "Custom option deleted successfully",
      data: {
        customOptionId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getcustomoptionByid = async (req, res, next) => {
  try {
    const customoption = await CustomOption.findById(req.params.id)
      .populate('celebrity', 'name')
      .populate('createdBy', 'name email');

    if (!customoption) {
      throw createError(404, "Custom option not found");
    }

    res.status(200).json({ 
      success: true,
      message: "Data retrieved successfully",
      data: customoption 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addcustomoption,
  updateStatus,
  updatecustomoption,
  getdata,
  deletecustomoption,
  getcustomoptionByid,
};