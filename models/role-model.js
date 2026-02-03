const { Schema, model } = require("mongoose");

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Role name must be at least 2 characters"],
      maxlength: [50, "Role name cannot exceed 50 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    is_system: {
      type: Boolean,
      default: false,
      index: true,
      immutable: true, // Once set, cannot be changed
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.is_system;
      },
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
roleSchema.index({ name: 1, status: 1 });
roleSchema.index({ is_system: 1, status: 1 });

// Virtual for isActive
roleSchema.virtual("isActive").get(function () {
  return this.status === 1;
});

// Pre-validate: Auto-generate slug
roleSchema.pre("validate", function (next) {
  if ((this.isNew && this.name) || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

// Pre-save: Protect system role names from modification
roleSchema.pre("save", function (next) {
  if (this.is_system && this.isModified("name") && !this.isNew) {
    return next(new Error("Operation not permitted"));
  }
  next();
});

// Pre-update: Protect system roles from updates (generic error)
roleSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate && docToUpdate.is_system) {
      return next(new Error("Operation not permitted"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

roleSchema.pre("updateOne", async function (next) {
  try {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate && docToUpdate.is_system) {
      return next(new Error("Operation not permitted"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-delete: Protect system roles from deletion (generic error)
roleSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  if (this.is_system) {
    return next(new Error("Operation not permitted"));
  }
  next();
});

roleSchema.pre("findOneAndDelete", async function (next) {
  try {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete && docToDelete.is_system) {
      return next(new Error("Operation not permitted"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

roleSchema.pre("deleteMany", async function (next) {
  try {
    const query = this.getQuery();
    const docsToDelete = await this.model.find(query);
    const hasSystemRole = docsToDelete.some(doc => doc.is_system);
    if (hasSystemRole) {
      return next(new Error("Operation not permitted"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

const RoleModel = model("Role", roleSchema);

module.exports = RoleModel;