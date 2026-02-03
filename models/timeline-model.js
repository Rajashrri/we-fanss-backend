// models/client-model.js
const { Schema, model } = require("mongoose");

const timelinechema = new Schema({
  title: { type: String, required: true },
  url: { type: String },
   description: { type: String },
  status: { type: String },
  createdAt: { type: String },
      createdBy :{ type: String},
    media: { type: String },
  from_year: { type: String },
   to_year: { type: String },
celebrityId: { type: String }, // movie title
});

module.exports = model('timeline', timelinechema); // ✅ default export
