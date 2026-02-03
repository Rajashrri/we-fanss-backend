const SectionMaster = require("../models/sectionmaster-model");
const mongoose = require("mongoose");
const { SectionTemplate } = require("../models/sectiontemplate-model");

// ✅ Get Section Master by ID (for Dynamic Form)
const getSectionTemplateById = async (req, res) => {
  try {
    const sectionMasterId = req.params.id;
console.log(sectionMasterId);
    // 🔹 Find one section master by its ID
    const section = await SectionMaster.findById(sectionMasterId);

    if (!section) {
      return res.status(404).json({
        status: false,
        msg: "Section Master not found",
      });
    }

    // 🔹 Send only the section master document
    res.status(200).json({
      status: true,
      data: section, // contains fieldsConfig array
    });
  } catch (error) {
    console.error("Error fetching Section Master:", error);
    res.status(500).json({
      status: false,
      msg: "Server error while fetching section master",
    });
  }
};
// ✅ Delete Dynamic Section Data
const deleteTemplateData = async (req, res) => {
  try {
    const { celebId, sectionName, dataId } = req.params;

    if (!celebId || !sectionName || !dataId) {
      return res.status(400).json({
        success: false,
        msg: "Missing required parameters",
      });
    }

    const modelName = sectionName.toLowerCase();
    const DynamicModel =
      mongoose.models[modelName] ||
      mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));

    const deleted = await DynamicModel.findOneAndDelete({
      _id: dataId,
      celebId,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, msg: "Data not found for deletion" });
    }

    res.json({ success: true, msg: "Section data deleted successfully" });
  } catch (err) {
    console.error("Error deleting dynamic section data:", err);
    res.status(500).json({ success: false, msg: "Server error while deleting" });
  }
};



const getSectionDataBySectionId = async (req, res) => {
  try {
    const { celebId, id } = req.params;

    // Find section master by ID
    const section = await SectionMaster.findById(id);
    if (!section) {
      return res.status(404).json({
        success: false,
        msg: "Section Master not found",
      });
    }

    // Dynamic collection name from section name (e.g., Team -> team)
    const collectionName = section.name.toLowerCase();

    // Dynamic model creation
    const DynamicModel =
      mongoose.models[collectionName] ||
      mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false })
      );

    // Fetch all data entries for this celebId
    const data = await DynamicModel.find({ celebId });

    return res.status(200).json({
      success: true,
      sectionName: section.name,
      fields: section.fieldsConfig,
      data,
    });
  } catch (err) {
    console.error("Error fetching section data:", err);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching section data",
    });
  }
};
// ✅ Save Dynamic Template Data
const saveDynamicTemplateData = async (req, res) => {
  try {
    const { celebId, templateId } = req.body;
console.log(celebId);
    if (!celebId || !templateId) {
      return res.status(400).json({ success: false, msg: "Missing IDs" });
    }

    // ✅ Build nested structure dynamically
    const data = {};
    for (const key in req.body) {
      if (key.includes(".")) {
        const [section, field] = key.split(".");
        if (!data[section]) data[section] = {};
        data[section][field.replace("[]", "")] = req.body[key];
      }
    }

    // ✅ Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const [section, field] = file.fieldname.split(".");
        if (!data[section]) data[section] = {};
        data[section][field] = `/template/${file.filename}`;
      });
    }

    // ✅ Save each section’s data into its own dynamic collection
    for (const sectionName of Object.keys(data)) {
      const sectionData = data[sectionName];

      // Define fields dynamically
      const fields = {};
      for (const key of Object.keys(sectionData)) {
        fields[key] = { type: mongoose.Schema.Types.Mixed };
      }

      fields.celebId = { type: String };
      fields.templateId = { type: String };
      fields.createdAt = { type: Date, default: Date.now };

      const modelName = sectionName.toLowerCase();
      const DynamicModel =
        mongoose.models[modelName] ||
        mongoose.model(modelName, new mongoose.Schema(fields));

      const doc = new DynamicModel({ ...sectionData, celebId, templateId });
      await doc.save();
    }

    res.json({ success: true, msg: "Data saved successfully" });
  } catch (err) {
    console.error("Error saving dynamic template data:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


// ✅ Fetch Dynamic Data by ID (for Edit Form)
const getTemplateDataById = async (req, res) => {
  try {
    const { celebId, sectionId, dataId } = req.params;

    // 1️⃣ Find which section this ID belongs to
    const section = await SectionMaster.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        msg: "Section Master not found",
      });
    }

    // 2️⃣ Dynamic collection name from section name
    const collectionName = section.name.toLowerCase();

    // 3️⃣ Create or reuse a model dynamically
    const DynamicModel =
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

    // 4️⃣ Fetch that specific record
    const record = await DynamicModel.findOne({ _id: dataId, celebId });

    if (!record) {
      return res.status(404).json({
        success: false,
        msg: "Section data not found",
      });
    }

    // 5️⃣ Send full record back
    res.json({ success: true, data: record });
  } catch (err) {
    console.error("Fetch template data error:", err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};


// ---------------------------------------------
// ✅ Update Template Data (Dynamic)
const updateTemplateData = async (req, res) => {
  try {
    const { celebId, sectionName, dataId } = req.body;

    if (!celebId || !sectionName || !dataId) {
      return res.status(400).json({
        success: false,
        msg: "Missing required parameters (celebId, sectionName, dataId)",
      });
    }

    // 🔹 Prepare update data
    const updateData = {};

    // Handle text/select/array fields
    Object.keys(req.body).forEach((key) => {
      if (key.startsWith(`${sectionName}.`)) {
        const fieldKey = key.replace(`${sectionName}.`, "").replace("[]", "");
        updateData[fieldKey] = req.body[key];
      }
    });

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const [section, field] = file.fieldname.split(".");
        if (section === sectionName) {
          updateData[field] = `/template/${file.filename}`;
        }
      });
    }

    // ✅ Create or reuse the dynamic model (same as in saveDynamicTemplateData)
    const modelName = sectionName.toLowerCase();
    const DynamicModel =
      mongoose.models[modelName] ||
      mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));

    // 🔹 Update record
    const updatedRecord = await DynamicModel.findOneAndUpdate(
      { _id: dataId, celebId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        msg: "Section data not found for update",
      });
    }

    res.json({
      success: true,
      msg: "Section data updated successfully",
      data: updatedRecord,
    });
  } catch (err) {
    console.error("Error updating dynamic template data:", err);
    res.status(500).json({
      success: false,
      msg: "Server error while updating section data",
    });
  }
};


module.exports = { getSectionTemplateById, saveDynamicTemplateData,getSectionDataBySectionId,getTemplateDataById,updateTemplateData,deleteTemplateData };
