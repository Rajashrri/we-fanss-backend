const { Positions } = require("../models/positions-model");
const { Language } = require("../models/language-model");

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
    const item = await Language.find({ status: 1 });
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

 
const addPositions = async (req, res) => {
  try {
    const {
      title,
      department,
      level,
      from_date,
      to_date,
      current,
      state,
      constituency,
      party,
      reporting,
      work,
      reference, // JSON string
      celebrityId,
      createdBy,
      sort,
      statusnew,
    } = req.body;

    // ✅ Single image or video upload
    const mediaFile = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Duplicate check — avoid same title + level + celebrityId
    const existingPosition = await Positions.findOne({
      celebrityId,
      title: { $regex: new RegExp(`^${title}$`, "i") },
      level,
    });

    if (existingPosition) {
      return res.status(400).json({
        status: false,
        msg: "This position already exists for the celebrity.",
      });
    }

    // ✅ Clean URL slug
    const url = createCleanUrl(`${title}-${level}-${state || "na"}`);

    // ✅ Parse reference links safely
    let parsedReference = [];
    try {
      parsedReference = reference ? JSON.parse(reference) : [];
    } catch (err) {
      console.error("Invalid reference JSON:", err);
    }

    // ✅ Create new Positions document
    const newPosition = await Positions.create({
      title,
      department,
      level,
      from_date,
      to_date,
      current,
      state,
      constituency,
      party,
      reporting,
      work,
      reference: parsedReference,
      celebrityId,
      createdBy,
      sort,
      statusnew,
      image: mediaFile,
      createdAt,
      url,
      status: "1",
    });

    return res.status(201).json({
      status: true,
      msg: "Position added successfully",
      data: newPosition,
    });
  } catch (error) {
    console.error("Add Position Error:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error", error });
  }
};
//update status

const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await Positions.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      msg: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const updatePositions = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      title,
      department,
      level,
      from_date,
      to_date,
      current,
      state,
      constituency,
      party,
      reporting,
      work,
      reference,
      sort,
      statusnew,
    } = req.body;

    // ✅ Handle file upload (image/video)
    const mediaFile = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    // ✅ Parse reference safely
    let parsedReference = [];
    try {
      if (typeof reference === "string") {
        parsedReference = JSON.parse(reference);
      } else if (Array.isArray(reference)) {
        parsedReference = reference;
      }
    } catch (err) {
      console.error("Invalid reference JSON:", err);
      parsedReference = [];
    }

    // ✅ Build update object
    const updateData = {
      title,
      department,
      level,
      from_date,
      to_date,
      current,
      state,
      constituency,
      party,
      reporting,
      work,
      reference: parsedReference,
      sort,
      statusnew,
      updatedAt: new Date(),
    };

    if (mediaFile) updateData.image = mediaFile;

    // ✅ Perform update
    const updatedPosition = await Positions.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPosition) {
      return res
        .status(404)
        .json({ status: false, msg: "Position not found" });
    }

    return res.status(200).json({
      status: true,
      msg: "Position updated successfully",
      data: updatedPosition,
    });
  } catch (error) {
    console.error("Update Position Error:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
};

//get table data

const getPositionsByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;
    const positions = await Positions.find({ celebrityId });
    res.json({ status: true, msg: positions });
  } catch (error) {
    console.error("Get Positions Error:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

//delete

const deletepositions = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Positions.findOneAndDelete({ _id: id });

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
    console.error("Delete Positions error:", error);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

//for edit

// backend: controller
const getpositionsByid = async (req, res) => {
  try {
    const project = await Positions.findOne({ _id: req.params.id });

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
  addPositions,
  languageOptions,
  updateStatus,
  updatePositions,
  getPositionsByCelebrity,
  deletepositions,
  getpositionsByid,
};
