// models/testimonial-model.js
const { Schema, model } = require("mongoose");

const testimonialSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String },
  status: { type: String },
  createdAt: { type: String },
      createdBy :{ type: String},
    image: { type: String },
     designation: { type: String },
      feedback: { type: String },


});

module.exports = model('testimonial', testimonialSchema); // ✅ default export
