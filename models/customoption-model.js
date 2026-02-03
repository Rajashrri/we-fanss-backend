// models/client-model.js
const { Schema, model } = require("mongoose");

const customoptionchema = new Schema({
  title: { type: String, required: true },
  url: { type: String },
   description: { type: String },
  status: { type: String }, // 0 , 1. -> convert number
  createdAt: { type: String },
      createdBy :{ type: String},
    media: { type: String },
 
celebrityId: { type: String }, // movie title // object id mongodb
});

module.exports = model('customoption', customoptionchema); // ✅ default export
