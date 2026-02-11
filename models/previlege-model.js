const { Schema, model } = require("mongoose");
const { OPERATIONS, PRIVILEGE_RESOURCES } = require("../utils/constant/privilege-constant");

const permissionSchema = new Schema({
  resource: {
    type: String,
    required: true,
    enum: Object.values(PRIVILEGE_RESOURCES),
    trim: true,
  },
  operations: {
    type: Map,
    of: Boolean,
    required: true,
    validate: {
      validator: function (operationsMap) {
        const validOps = Object.values(OPERATIONS);
        for (let key of operationsMap.keys()) {
          if (!validOps.includes(key)) return false;
        }
        return true;
      },
      message: "Invalid operation key detected",
    },
  },
}, { _id: false });


// ✅ PUBLISH allowed only for celebrity.* resources
permissionSchema.pre("validate", function (next) {
  const operationsMap = this.operations;

  if (operationsMap?.get(OPERATIONS.PUBLISH)) {
    if (!this.resource.startsWith("celebrity.")) {
      return next(
        new Error("PUBLISH operation is only allowed for Celebrity module resources")
      );
    }
  }

  next();
});


const privilegeSchema = new Schema({
  role: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
    unique: true,
    index: true,
  },
  permissions: [permissionSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});


privilegeSchema.index({ "permissions.resource": 1 });
privilegeSchema.index({ roleId: 1, isActive: 1 });


// Prevent modification of locked privileges
privilegeSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  async function (next) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc?.isLocked) {
      return next(
        new Error("Cannot modify locked privilege - this is a system-protected role")
      );
    }
    next();
  }
);

const Privilege = model("Privilege", privilegeSchema);
module.exports = Privilege;
