const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Role = require('../models/role-model');
const Privilege = require('../models/previlege-model');
const User = require('../models/user-model');

const { STATIC_ROLES, STATIC_PRIVILEGES } = require('../config/role-config');
const { PRIVILEGE_RESOURCES, OPERATIONS } = require('../utils/constant/privilege-constant');

const STATIC_USERS = {
  SUPER_ADMIN: {
    name: 'Suman Vyas',
    email: 'suman@digihost.in',
    password: 'Suman@123',
  },

  ADMIN: {
    name: 'Abhishek Sharma',
    email: 'abhishekshaxma8356@gmail.com',
    password: 'Abhishek@123',
  }
};

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

const generateTOTPCredentials = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `WeFans (${email})`,
    issuer: 'WeFans'
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    totpSecret: secret.base32,
    totpQrCode: qrCodeUrl
  };
};

const convertOperationsToMap = (permissions) =>
  permissions.map(permission => ({
    resource: permission.resource,
    operations: permission.operations.reduce((acc, operation) => {
      acc[operation] = true;
      return acc;
    }, {})
  }));


const seedRoles = async () => {
  const superAdminRole = await Role.findOneAndUpdate(
    { name: STATIC_ROLES.SUPER_ADMIN },
    {
      name: STATIC_ROLES.SUPER_ADMIN,
      slug: generateSlug(STATIC_ROLES.SUPER_ADMIN),
      description: 'System administrator with full access',
      isActive: true
    },
    { upsert: true, new: true }
  );

  const adminRole = await Role.findOneAndUpdate(
    { name: STATIC_ROLES.ADMIN },
    {
      name: STATIC_ROLES.ADMIN,
      slug: generateSlug(STATIC_ROLES.ADMIN),
      description: 'Administrator with content management access',
      isActive: true
    },
    { upsert: true, new: true }
  );

  return { superAdminRole, adminRole };
};


const seedPrivileges = async (superAdminRole, adminRole) => {
  const roles = [
    { role: STATIC_ROLES.SUPER_ADMIN, roleId: superAdminRole._id },
    { role: STATIC_ROLES.ADMIN, roleId: adminRole._id }
  ];

  for (const r of roles) {
    const permissions = convertOperationsToMap(
      STATIC_PRIVILEGES[r.role].permissions
    );

    await Privilege.findOneAndUpdate(
      { role: r.role },
      {
        role: r.role,
        roleId: r.roleId,
        permissions,
        isActive: true,
        isLocked: true
      },
      { upsert: true, new: true }
    );
  }
};

/* -------------------------------------------------- */
/* AUTO SYNC NEW RESOURCES */
/* -------------------------------------------------- */
const syncNewResourcesToRoles = async () => {
  const allResources = Object.values(PRIVILEGE_RESOURCES);
  const privileges = await Privilege.find({});

  for (const privilege of privileges) {
    const existingResources = privilege.permissions.map(p => p.resource);

    for (const resource of allResources) {
      if (!existingResources.includes(resource)) {
        let defaultOps = [];

        if (privilege.role === STATIC_ROLES.SUPER_ADMIN) {
          defaultOps = Object.values(OPERATIONS);
        }

        if (privilege.role === STATIC_ROLES.ADMIN) {
          defaultOps = resource.startsWith('celebrity.')
            ? [OPERATIONS.ADD, OPERATIONS.EDIT, OPERATIONS.PUBLISH]
            : [OPERATIONS.ADD, OPERATIONS.EDIT];
        }

        privilege.permissions.push({
          resource,
          operations: defaultOps.reduce((acc, op) => {
            acc[op] = true;
            return acc;
          }, {})
        });
      }
    }

    await privilege.save();
  }

  console.log('✅ Future resources synced to all roles');
};

/* -------------------------------------------------- */
/* USER SEED */
/* -------------------------------------------------- */
const seedUsers = async (superAdminRole, adminRole) => {
  const createUserIfNotExists = async (userConfig, roleId) => {
    const existing = await User.findOne({ email: userConfig.email });
    if (existing) return;

    const totpCreds = await generateTOTPCredentials(userConfig.email);

    await User.create({
      name: userConfig.name,
      email: userConfig.email,
      password: userConfig.password,
      role: roleId,
      isActive: true,
      isVerified: true,
      totpSecret: totpCreds.totpSecret,
      totpQrCode: totpCreds.totpQrCode
    });
  };

  await createUserIfNotExists(STATIC_USERS.SUPER_ADMIN, superAdminRole._id);
  await createUserIfNotExists(STATIC_USERS.ADMIN, adminRole._id);
};

/* -------------------------------------------------- */
/* MAIN SEED */
/* -------------------------------------------------- */
const seedStaticData = async () => {
  const { superAdminRole, adminRole } = await seedRoles();
  await seedPrivileges(superAdminRole, adminRole);
  await syncNewResourcesToRoles();
  await seedUsers(superAdminRole, adminRole);
};

/* -------------------------------------------------- */
/* RUN */
/* -------------------------------------------------- */
const run = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wefanss-dev");
    console.log('🌱 Seeding started...');
    await seedStaticData();
    console.log('🎉 Seeding completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
