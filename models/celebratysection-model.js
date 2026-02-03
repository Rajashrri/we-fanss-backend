// models/celebratysection-model.js
const { Schema, model } = require("mongoose");

const celebratySectionSchema = new Schema({
  celebratyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Celebrity',
    required: true 
  },
  professions: { 
    type: Schema.Types.ObjectId, 
    ref: 'Profession',
    required: true 
  },
  sectionmaster: { 
    type: Schema.Types.ObjectId, 
    ref: 'SectionMaster',
    required: true 
  },
  templateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SectionTemplate',
    required: true 
  },
  sectiontemplate: { 
    type: String,
    trim: true
  },
  flag: { 
    type: Number, 
    enum: [0, 1], 
    default: 1 
  },
  status: { 
    type: Number, 
    enum: [0, 1], 
    default: 0  
  }
}, { 
  timestamps: true 
});

module.exports = model("celebratysection", celebratySectionSchema);