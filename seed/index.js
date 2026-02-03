// scripts/seedStaticData.js

const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const Role = require('../models/role-model');
const Privilege = require('../models/previlege-model');
const User = require('../models/user-model');
const { STATIC_ROLES, STATIC_PRIVILEGES } = require('../config/role-config');

// Static users configuration
const STATIC_USERS = {
  SUPER_ADMIN: {
    name: 'Suman Vyas',
    email: 'suman@digihost.in',
    password: 'Suman@123',
    role: STATIC_ROLES.SUPER_ADMIN,
    isVerified: true,
    isActive: true
  },
  ADMIN: {
    name: 'Abhishek Sharma',
    email: 'abhishekshaxma8356@gmail.com',
    password: 'Abhishek@123',
    role: STATIC_ROLES.ADMIN,
    isVerified: true,
    isActive: true
  }
};

// Helper: Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
};

// Helper: Generate TOTP credentials
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

// Helper: Convert array operations to boolean map
const convertOperationsToMap = (permissions) => {
  return permissions.map(permission => ({
    resource: permission.resource,
    operations: permission.operations.reduce((acc, operation) => {
      acc[operation] = true;
      return acc;
    }, {})
  }));
};

// Seed roles
const seedRoles = async () => {
  const superAdminRole = await Role.findOneAndUpdate(
    { name: STATIC_ROLES.SUPER_ADMIN },
    {
      name: STATIC_ROLES.SUPER_ADMIN,
      slug: generateSlug(STATIC_ROLES.SUPER_ADMIN),
      description: 'System administrator with full access',
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const adminRole = await Role.findOneAndUpdate(
    { name: STATIC_ROLES.ADMIN },
    {
      name: STATIC_ROLES.ADMIN,
      slug: generateSlug(STATIC_ROLES.ADMIN),
      description: 'Administrator with limited access',
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Super Admin Role ID:', superAdminRole._id);
  console.log('✅ Admin Role ID:', adminRole._id);

  return { superAdminRole, adminRole };
};

// Seed privileges
const seedPrivileges = async (superAdminRole, adminRole) => {
  // Convert SUPER_ADMIN permissions from array to boolean map
  const superAdminPermissions = convertOperationsToMap(
    STATIC_PRIVILEGES[STATIC_ROLES.SUPER_ADMIN].permissions
  );

  const superAdminPrivilege = await Privilege.findOneAndUpdate(
    { role: STATIC_ROLES.SUPER_ADMIN },
    {
      role: STATIC_ROLES.SUPER_ADMIN,
      roleId: superAdminRole._id,
      permissions: superAdminPermissions,
      isActive: true,
      isLocked: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Convert ADMIN permissions from array to boolean map
  const adminPermissions = convertOperationsToMap(
    STATIC_PRIVILEGES[STATIC_ROLES.ADMIN].permissions
  );

  const adminPrivilege = await Privilege.findOneAndUpdate(
    { role: STATIC_ROLES.ADMIN },
    {
      role: STATIC_ROLES.ADMIN,
      roleId: adminRole._id,
      permissions: adminPermissions,
      isActive: true,
      isLocked: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Super Admin Privilege created with', superAdminPrivilege.permissions.length, 'permissions');
  console.log('✅ Admin Privilege created with', adminPrivilege.permissions.length, 'permissions');
};

// Seed users
const seedUsers = async (superAdminRole, adminRole) => {
  // Super Admin
  const existingSuperAdmin = await User.findOne({ email: STATIC_USERS.SUPER_ADMIN.email });
  if (!existingSuperAdmin) {
    const totpCreds = await generateTOTPCredentials(STATIC_USERS.SUPER_ADMIN.email);
    
    const superAdminUser = new User({
      name: STATIC_USERS.SUPER_ADMIN.name,
      email: STATIC_USERS.SUPER_ADMIN.email,
      password: STATIC_USERS.SUPER_ADMIN.password,
      role: superAdminRole._id,
      isActive: true,
      isVerified: true,
      totpSecret: totpCreds.totpSecret,
      totpQrCode: totpCreds.totpQrCode
    });
    
    await superAdminUser.save();
    console.log('✅ Super Admin user created:', STATIC_USERS.SUPER_ADMIN.email);
    console.log('📱 TOTP QR Code available in user document');
  } else {
    console.log('ℹ️  Super Admin user already exists:', STATIC_USERS.SUPER_ADMIN.email);
  }

  // Admin
  const existingAdmin = await User.findOne({ email: STATIC_USERS.ADMIN.email });
  if (!existingAdmin) {
    const totpCreds = await generateTOTPCredentials(STATIC_USERS.ADMIN.email);
    
    const adminUser = new User({
      name: STATIC_USERS.ADMIN.name,
      email: STATIC_USERS.ADMIN.email,
      password: STATIC_USERS.ADMIN.password,
      role: adminRole._id,
      isActive: true,
      isVerified: true,
      totpSecret: totpCreds.totpSecret,
      totpQrCode: totpCreds.totpQrCode
    });
    
    await adminUser.save();
    console.log('✅ Admin user created:', STATIC_USERS.ADMIN.email);
    console.log('📱 TOTP QR Code available in user document');
  } else {
    console.log('ℹ️  Admin user already exists:', STATIC_USERS.ADMIN.email);
  }
};

// Main seed function
const seedStaticData = async () => {
  console.log('🌱 Starting seeding process...');
  console.log('');
  
  const { superAdminRole, adminRole } = await seedRoles();
  console.log('');
  
  await seedPrivileges(superAdminRole, adminRole);
  console.log('');
  
  await seedUsers(superAdminRole, adminRole);
  console.log('');
  
  console.log('🎉 Seeding completed successfully!');
};

// Execute
const run = async () => {
  const DB_URI = "mongodb+srv://abhishekreactdev:Abhishek8928@cluster0.ap5am.mongodb.net/wefanss-prod-two";

  try {
    console.log('📡 Connecting to database...');
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to database');
    console.log('');
    
    await seedStaticData();
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();