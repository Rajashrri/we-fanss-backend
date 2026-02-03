const slugify = require("slugify");

/**
 * Generate slug from name or provided slug
 * @param {Object} options - { name, slug }
 * @returns {string|undefined} Generated slug
 */
const generateSlug = ({ name, slug }) => {
  if (slug && slug.trim()) {
    return slugify(slug.trim(), { lower: true, strict: true });
  }
  if (name && name.trim()) {
    return slugify(name.trim(), { lower: true, strict: true });
  }
  return undefined;
};

module.exports =  generateSlug;