/**
 * Parse nested form-data into proper nested objects
 */
const parseNestedFormData = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }

  const parsed = {};

  Object.keys(req.body).forEach((key) => {
    const value = req.body[key];

    // Handle nested keys like: identityProfile[name]
    if (key.includes("[") && key.includes("]")) {
      const parts = key.split(/\[|\]/).filter(Boolean);
      let current = parsed;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          const nextPart = parts[i + 1];
          current[part] = !isNaN(nextPart) ? [] : {};
        }
        current = current[part];
      }

      const lastPart = parts[parts.length - 1];
      
      let parsedValue = value;
      if (typeof value === "string") {
        if (
          (value.startsWith("[") && value.endsWith("]")) ||
          (value.startsWith("{") && value.endsWith("}"))
        ) {
          try {
            parsedValue = JSON.parse(value);
          } catch (e) {
            parsedValue = value;
          }
        } else if (value === "true") {
          parsedValue = true;
        } else if (value === "false") {
          parsedValue = false;
        } else if (!isNaN(value) && value.trim() !== "") {
          parsedValue = Number(value);
        }
      }

      current[lastPart] = parsedValue;
    } else {
      let parsedValue = value;
      if (typeof value === "string") {
        if (
          (value.startsWith("[") && value.endsWith("]")) ||
          (value.startsWith("{") && value.endsWith("}"))
        ) {
          try {
            parsedValue = JSON.parse(value);
          } catch (e) {
            parsedValue = value;
          }
        } else if (value === "true") {
          parsedValue = true;
        } else if (value === "false") {
          parsedValue = false;
        } else if (!isNaN(value) && value.trim() !== "") {
          parsedValue = Number(value);
        }
      }
      parsed[key] = parsedValue;
    }
  });

  req.body = parsed;
  console.log("✅ Parsed form-data:", JSON.stringify(req.body, null, 2));
  next();
};

module.exports = { parseNestedFormData };