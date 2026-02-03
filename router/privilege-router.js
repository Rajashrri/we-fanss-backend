const express = require("express");
const router = express.Router();

const {
  getUserPrivileges,
  getPrivilegesByRoleId,
  setPrivileges
} = require("../controllers/privilege-controller");

const validate = require("../middlewares/validate.middleware");
const { setPrivilegesSchema } = require("../shared/schema/privilege-schema");
const authMiddleware = require("../middlewares/auth-middleware");

// Get all privileges
router.get('/', authMiddleware, getUserPrivileges);

// Get privileges by role ID
router.get(
  "/role/:id",
  authMiddleware,
  getPrivilegesByRoleId
);

// Set/Update privileges for a role
router.put(
  "/role/:id",
  authMiddleware,
  validate(setPrivilegesSchema),
  setPrivileges
);

module.exports = router;