const { default: mongoose } = require("mongoose");
const { Election } = require("../models/election-model");
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

 const addElection = async (req, res) => {
  try {
    const {
      election_year,
      type,
      state,
      constituency,
      party,
      role,
      result,
      vote_share,
      votes,
      opponent,
      notes,
      reference, // from frontend (JSON string)
      celebrityId,
      createdBy,
      sort,
      statusnew,
    } = req.body;

   if (!mongoose.Types.ObjectId.isValid(celebrityId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid celebrityId. Please provide a valid MongoDB ObjectId."
  });
}


    // ✅ Single image or video upload
    const mediaFile = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Duplicate check — avoid adding duplicate election for same year & celebrity
    const existingElection = await Election.findOne({
      celebrityId,
      election_year,
      type,
    });

    if (existingElection) {
      return res.status(400).json({
        status: false,
        msg: "Election already exists for this year and type.",
      });
    }

    // ✅ Clean URL slug
    const url = createCleanUrl(`${state}-${type}-${election_year}`);

    // ✅ Parse reference links JSON safely
    let parsedReference = [];
    try {
      parsedReference = reference ? JSON.parse(reference) : [];
    } catch (err) {
      console.error("Invalid reference JSON:", err);
    }

    // ✅ Create new Election document
    const newElection = await Election.create({
      election_year,
      type,
      state,
      constituency,
      party,
      role,
      result,
      vote_share,
      votes,
      opponent,
      notes,
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
      msg: "Election added successfully",
      data: newElection,
    });
  } catch (error) {
    console.error("Add Election Error:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error", error });
  }
};
//update status

const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;




    const result = await Election.updateOne(
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
 const updateElection = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      election_year,
      type,
      state,
      constituency,
      party,
      role,
      result,
      vote_share,
      votes,
      opponent,
      notes,
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
      election_year,
      type,
      state,
      constituency,
      party,
      role,
      result,
      vote_share,
      votes,
      opponent,
      notes,
      reference: parsedReference,
      sort,
      statusnew,
      updatedAt: new Date(),
    };

    if (mediaFile) {
      updateData.image = mediaFile;
    }

    // ✅ Perform update
    const result2 = await Election.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!result2) {
      return res.status(404).json({ status: false, msg: "Election not found" });
    }

    res.status(200).json({
      status: true,
      msg: "Election updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Election Error:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
};

//get table data

const getElectionByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;
    const election = await Election.find({ celebrityId });
    res.json({ status: true, msg: election });
  } catch (error) {
    console.error("Get Election Error:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

//delete

const deleteelection = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Election.findOneAndDelete({ _id: id });

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
    console.error("Delete Election error:", error);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

//for edit

// backend: controller
const getelectionByid = async (req, res) => {
  try {
    const project = await Election.findOne({ _id: req.params.id });

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
  addElection,
  languageOptions,
  updateStatus,
  updateElection,
  getElectionByCelebrity,
  deleteelection,
  getelectionByid,
};
