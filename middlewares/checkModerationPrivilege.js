// middleware/checkModerationPrivilege.js

const { PRIVILEGE_RESOURCES } = require('../utils/constant/privilege-constant');
const {checkPrivilege} = require('../middlewares/privilege-middleware');
const createHttpError = require('http-errors');

/**
 * Dynamic privilege checker for moderation routes
 * Maps module param to appropriate resource and checks privilege
 */
const checkModerationPrivilege = (operation) => {
  return (req, res, next) => {
    const { module } = req.params;
    
    // Map module names to PRIVILEGE_RESOURCES
    const MODULE_RESOURCE_MAP = {
      
      'celebrity': PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO,
      'timeline': PRIVILEGE_RESOURCES.CELEBRITY_TIMELINE,
      'trivia': PRIVILEGE_RESOURCES.CELEBRITY_TRIVIA,
      'relation': PRIVILEGE_RESOURCES.CELEBRITY_RELATED_PERSONALITIES,
      'reference': PRIVILEGE_RESOURCES.CELEBRITY_REFERENCES,
      'dynamic-section': PRIVILEGE_RESOURCES.CELEBRITY_DYNAMIC_SECTIONS,
      'custom-section': PRIVILEGE_RESOURCES.CELEBRITY_CUSTOM_SECTIONS,
      

    };
    
    // Get the resource based on module
    const resource = MODULE_RESOURCE_MAP[module];
    
    if (!resource) {
      return next(createHttpError(400, `Invalid or unmapped module: ${module}`));
    }
    
    
    return checkPrivilege(resource, operation)(req, res, next);
  };
};

module.exports = checkModerationPrivilege;