const { Schema, model } = require("mongoose");
const { OPERATIONS, RESOURCES } = require("../utils/constant/privilege-constant");

const permissionSchema = new Schema({
  resource: {
    type: String,
    required: true,
    enum: Object.values(RESOURCES),
    trim: true
  },
  operations: {
    type: Map,
    of: Boolean,
    required: true,
    validate: {
      validator: function(operationsMap) {
        // Ensure all keys are valid operations
        const validOps = Object.values(OPERATIONS);
        for (let key of operationsMap.keys()) {
          if (!validOps.includes(key)) {
            return false;
          }
        }
        return true;
      },
      message: 'Invalid operation key detected'
    }
  }
}, { _id: false });

// ✅ Custom validation: publish only allowed for celebrity
permissionSchema.pre('validate', function(next) {
  const operationsMap = this.operations;
  
  // Check if PUBLISH exists in operations
  if (operationsMap && operationsMap.has(OPERATIONS.PUBLISH)) {
    if (this.resource !== RESOURCES.CELEBRITY) {
      return next(new Error('PUBLISH operation is only allowed for CELEBRITY resource'));
    }
  }
  
  next();
});

const privilegeSchema = new Schema({
  role: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  roleId: {
    type: Schema.Types.ObjectId,  
    ref: "Role",                  
    required: true,
    unique: true,
    index: true
  },
  permissions: [permissionSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isLocked: {
    type: Boolean,
    default: false, 
    index: true
  }
}, {
  timestamps: true
});

// Indexes
privilegeSchema.index({ 'permissions.resource': 1 });
privilegeSchema.index({ roleId: 1, isActive: 1 });

// Prevent modification of locked privileges
privilegeSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], async function(next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc?.isLocked) {
    return next(new Error('Cannot modify locked privilege - this is a system-protected role'));
  }
  next();
});

// Prevent deletion of locked privileges
privilegeSchema.pre(['findOneAndDelete', 'deleteOne', 'deleteMany'], async function(next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc?.isLocked) {
    return next(new Error('Cannot delete locked privilege - this is a system-protected role'));
  }
  next();
});

const Privilege = model("Privilege", privilegeSchema);

module.exports = Privilege;