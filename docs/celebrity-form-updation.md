# 👤 Profile Form Field Documentation

This document defines:

- Which fields must be shown in the UI form  
- Which fields are admin-only  
- Which fields are system-managed (not shown in UI)  
- How AI/dev tools should respond when asked to update model, validation, or controller  

---

## 🟢 1. Fields Visible in Normal Form (Editor + Admin)

These fields should be displayed in the **Create / Edit Profile** form.

### 🧍 Identity & Profile (Core)

| Field | Type | Required | Notes |
|------|------|----------|------|
| Full Name (Display Name) | Text | ✅ | Public display name |
| Slug / Unique URL | Text | ✅ | Auto-generated but editable, must be unique |
| Profile Image | Single Image Upload | ✅ | Main profile photo |
| Gallery Images | Multiple Image Upload | ❌ | Optional media gallery |
| Short Intro / One-liner | Text | ❌ | Short summary |
| Biography | Rich Text Editor | ❌ | Full description |
| Status | Select | ✅ | Draft / In Review / Published / Archived |

---

### 👤 Personal Details

| Field | Type | Required | Notes |
|------|------|----------|------|
| Date of Birth | Date | ❌ | Used to auto-calculate age |
| Birthplace | Text | ❌ | City / State / Country |
| Gender | Select | ❌ | Male / Female / Other / Prefer not to say |
| Nationality | Text | ❌ | Country |
| Religion | Text | ❌ | Optional, low-priority |

🚫 **Do NOT include Age field in form** — it is calculated automatically.

---

### 👨‍👩‍👧 Family & Relationships  
Each field should include a **"Show on Public Profile"** checkbox.

| Field | Type | Required | Notes |
|------|------|----------|------|
| Father Name | Text + Checkbox | ❌ | Privacy controlled |
| Mother Name | Text + Checkbox | ❌ | Privacy controlled |
| Spouse / Partner | Text + Checkbox | ❌ | Privacy controlled |
| Children | Repeater (Name + Relation + Checkbox) | ❌ | Multiple entries allowed |
| Siblings | Repeater (Name + Relation + Checkbox) | ❌ | Multiple entries allowed |

---

### 💼 Professional Identity

| Field | Type | Required | Notes |
|------|------|----------|------|
| Professions | Multi-select | ✅ | From Profession Master |
| Primary Profession | Select | ✅ | Must be one of selected professions |
| Languages | Multi-select | ❌ | From Language Master |
| Primary Language | Select | ❌ | Optional highlight |
| Career Start Year | Year | ❌ | Format: YYYY |
| Career End Year | Year or "Present" Toggle | ❌ | Ongoing careers allowed |

---

### 📍 Location & Public Presence

| Field | Type | Required | Notes |
|------|------|----------|------|
| Current City / Base Location | Text | ❌ | Current working location |
| Known For Region | Tags / Multi-select | ❌ | India / State / City |

---

### ✨ Public Attributes

| Field | Type | Required | Notes |
|------|------|----------|------|
| Height | Text | ❌ | Keep flexible (cm/ft) |
| Signature Style / Known For | Text | ❌ | Short descriptor |

---

### 🌐 Official Links & Social Media

| Field | Type | Required |
|------|------|----------|
| Official Website | URL | ❌ |
| Wikipedia Link | URL | ❌ |
| Instagram | URL | ❌ |
| Facebook | URL | ❌ |
| X / Twitter | URL | ❌ |
| YouTube Channel | URL | ❌ |
| IMDb Link | URL | ❌ |
| Other Links | Repeater (Label + URL) | ❌ |

---

### 🔍 SEO & Discoverability

| Field | Type | Required |
|------|------|----------|
| Tags | Multi-select / Free tags | ❌ |
| SEO Meta Title | Text | ❌ |
| SEO Meta Description | Textarea | ❌ |
| SEO Keywords | Tag Input | ❌ |

---

## 🟡 2. Admin-Only Fields (Visible in Form Only for Admin Role)

| Field | Type | Notes |
|------|------|------|
| Featured / Priority Flag | Toggle | Used for homepage/trending |
| Verified / Claim Status | Select | Not Claimed / Claim Requested / Verified |
| Internal Notes | Textarea | Private admin notes |

---

## 🔒 3. System Fields (NOT Visible in Form UI)

### 🧠 Auto-Calculated / Derived
- Age (calculated from Date of Birth)
- Profile Completion Percentage (future use)

### 🕓 Audit Fields
- Created By (User ID)
- Updated By (User ID)
- Approved By (Admin ID)
- Created At (Timestamp)
- Updated At (Timestamp)
- Published At (Timestamp)

### 📊 Platform Analytics
- View Count
- Follower Count
- Popularity Score
- Trending Score
- Search Boost Score

### 🛡 Moderation & Claim System
- Claim Request User ID
- Verification Proof Documents (private)
- Rejection Reason (if profile is rejected)

---

# 🤖 AI / DEVELOPER INSTRUCTION RULES

This section defines how AI tools or developers should respond when given update instructions.

### ✅ If user says **"Fix the Model"**
You must:
- Update the **Mongoose schema**
- Add/remove fields according to this document
- Ensure correct field types
- Add enums where needed (Status, Gender, Claim Status)
- Add default values where logical
- Keep system fields hidden but present in schema

---

### ✅ If user says **"Fix Validation"**
You must:
- Update **request validation layer** (Zod / Joi / Express Validator etc.)
- Match validation rules with:
  - Required fields
  - Field formats (URL, Date, Year, Enum)
  - Array/repeater structures
- Do NOT include system-only fields in validation

---

### ✅ If user says **"Fix Controller"**
You must:
- Update controller logic for:
  - Creating profile
  - Updating profile
  - Handling repeaters (children, siblings, links)
  - Handling privacy toggles
- Ensure:
  - Slug uniqueness check
  - Proper status transitions
  - Admin-only fields editable only by admin
- Never allow system fields to be manually overridden

---

### ✅ If user says **"Fix API Response"**
You must:
- Hide internal fields:
  - Audit fields
  - Analytics fields
  - Internal notes
- Respect privacy toggles (family visibility)
- Return clean structured JSON for frontend

---

## ✅ Summary

| Category | In Form? | Visible To |
|---------|----------|------------|
| Profile Information | ✅ Yes | Editor + Admin |
| Admin Controls | ✅ Yes | Admin Only |
| System / Audit Data | ❌ No | Backend Only |

---

**End of Documentation**
