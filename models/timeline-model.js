// models/timeline-model.js
const { Schema, model } = require("mongoose");
const { moderationFields } = require("../models/schema/moderation-schema");

const timelineSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String 
  },
  description: { 
    type: String 
  },
  status: { 
    type: Number, 
    default: 1,    
    enum: [0, 1]  
  },
  createdAt: { 
    type: String   
  },
  createdBy: { 
    type: Schema.Types.ObjectId,  
    ref: "User"      
  },             
  media: { 
    type: String 
  },
  fromYear: {     
    type: String 
  },
  toYear: {      
    type: String 
  },
  celebrity: {  
    type: Schema.Types.ObjectId, 
    ref: "Celebrity",
    required: true 
  },

 
  ...moderationFields

}, {
  timestamps: true 
});

module.exports = model('Timeline', timelineSchema);