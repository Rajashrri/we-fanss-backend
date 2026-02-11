# Content Moderation Guide

This document explains **how moderation works for any module** (timelines, trivia, elections, etc.), what fields to store in DB, and **what steps you should follow** while implementing the feature.

---

## 🎯 Goal

When new content is added for any module (timeline, trivia, election, etc.):
1. It should **go to review (pending)**
2. An authorized person can **publish** it
3. It can also be **rejected**
4. Only published content is visible to users

---

## 🧠 Key Concept: Moderation State

**Moderation state** means:
> The current approval stage of any content (review, approved, or rejected)

This is **not** the same as active/inactive status.

---

## 🗂 Database Design

### Required Fields

Use the following fields to handle the complete moderation flow:

```js
const moderationFields = {
  // Primary moderation status
  moderationState: {
    type: String,
    enum: ['PENDING', 'PUBLISHED', 'REJECTED'],
    default: 'PENDING',
    required: true,
    index: true
  },

  // Who made the moderation decision (approve/reject)
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // When the moderation decision was made
  moderatedAt: {
    type: Date,
    default: null
  },

  // Optional remark/reason for the decision
  moderationRemark: {
    type: String,
    trim: true,
    default: null
  }
}
```

### Field Descriptions

| Field | Type | Purpose | Default |
|-------|------|---------|---------|
| `moderationState` | String (enum) | Current approval stage | `PENDING` |
| `moderatedBy` | ObjectId (User ref) | Who approved/rejected | `null` |
| `moderatedAt` | Date | When decision was made | `null` |
| `moderationRemark` | String | Reason/comment for decision | `null` |

---

## 📋 Moderation Flow

### 1️⃣ Content Creation

When any content (timeline/trivia/election) is created:

```json
{
  "moderationState": "PENDING",
  "moderatedBy": null,
  "moderatedAt": null,
  "moderationRemark": null
}
```

✅ Automatically goes to **review queue**

---

### 2️⃣ Review & Publish

When reviewer/admin approves and publishes:

```json
{
  "moderationState": "PUBLISHED",
  "moderatedBy": "507f1f77bcf86cd799439011",
  "moderatedAt": "2024-02-08T10:30:00Z",
  "moderationRemark": "Content looks good, approved"
}
```

✅ Content becomes **live & visible** to users

---

### 3️⃣ Review & Reject

When reviewer rejects:

```json
{
  "moderationState": "REJECTED",
  "moderatedBy": "507f1f77bcf86cd799439011",
  "moderatedAt": "2024-02-08T10:30:00Z",
  "moderationRemark": "Inappropriate content"
}
```

❌ Content is **not visible** to users

---

## 🔍 Common Queries

### Fetch content for review (Admin)

```js
{ moderationState: 'PENDING' }
```

### Fetch published content (User App)

```js
{ moderationState: 'PUBLISHED' }
```

### Fetch rejected content (Admin only)

```js
{ moderationState: 'REJECTED' }
```

### Fetch content moderated by specific user

```js
{ moderatedBy: userId }
```

### Fetch content moderated in date range

```js
{
  moderatedAt: {
    $gte: startDate,
    $lte: endDate
  }
}
```

---

## 🔄 API Implementation Example

### Publish Content

```js
async function publishContent(contentId, moderatorId, remark = null) {
  return await Content.findByIdAndUpdate(
    contentId,
    {
      moderationState: 'PUBLISHED',
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      moderationRemark: remark
    },
    { new: true }
  );
}
```

### Reject Content

```js
async function rejectContent(contentId, moderatorId, reason) {
  return await Content.findByIdAndUpdate(
    contentId,
    {
      moderationState: 'REJECTED',
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      moderationRemark: reason
    },
    { new: true }
  );
}
```

---

## 🧑‍💼 Role Responsibilities

### Creator
- Can create content (timelines/trivia/elections)
- Cannot publish directly
- All content starts in `PENDING` state

### Reviewer / Admin
- Can view pending content
- Can publish or reject
- Must provide moderation decision
- Can optionally add remarks

---

## 📊 Moderation Analytics

With these fields, you can track:

- **Who** made moderation decisions (`moderatedBy`)
- **When** decisions were made (`moderatedAt`)
- **Why** decisions were made (`moderationRemark`)
- **Moderation performance** (time from creation to decision)
- **Rejection patterns** (analyze rejection reasons)

---

## 🚫 What NOT To Do

- ❌ Don't use `status = 0 / 1`
- ❌ Don't mix this with `active / inactive`
- ❌ Don't use multiple flags for a simple flow
- ❌ Don't forget to populate `moderatedBy` when changing state
- ❌ Don't skip `moderatedAt` timestamp
- ❌ Don't make `moderationRemark` required (it should be optional)

---

## 🔐 Security Considerations

1. **Validate moderator permissions** before allowing state changes
2. **Index** `moderationState` for faster queries
3. **Immutable audit trail**: Once moderated, preserve the decision metadata
4. **Required fields**: Always set `moderatedBy` and `moderatedAt` when changing from `PENDING`

---

## 🎨 Frontend Display Tips

### Admin Panel - Pending Items
```js
Show: Title, Creator, Created At
Actions: [Approve] [Reject]
```

### Admin Panel - Moderation History
```js
Show: Title, State, Moderated By, Moderated At, Remark
```

### User App
```js
Only show: moderationState === 'PUBLISHED'
```

---

## 🔮 Future Extensions (Optional)

### Multi-step Approval
```js
PENDING → APPROVED → PUBLISHED
```

### Workflow States
```js
PENDING → UNDER_REVIEW → PUBLISHED/REJECTED
```

### Additional Audit Fields
```js
- reviewedBy (different from moderatedBy)
- reviewedAt
- publishedBy
- publishedAt
- revisionHistory: [{
    state: String,
    by: ObjectId,
    at: Date,
    remark: String
  }]
```

---

## ✅ Final Checklist

- [x] Use `moderationState` (PENDING | PUBLISHED | REJECTED)
- [x] Default new content to `PENDING`
- [x] Track `moderatedBy` (User ObjectId)
- [x] Track `moderatedAt` (timestamp)
- [x] Optional `moderationRemark` for context
- [x] Index `moderationState` for performance
- [x] Only show `PUBLISHED` content to users
- [x] Validate permissions before state changes

---

## 📝 Complete Schema Example

```js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MODERATION_STATES = Object.freeze({
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
});

const moderationFields = {
  moderationState: {
    type: String,
    enum: Object.values(MODERATION_STATES),
    default: MODERATION_STATES.PENDING,
    required: true,
    index: true,
  },

  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  moderatedAt: {
    type: Date,
    default: null,
  },

  moderationRemark: {
    type: String,
    trim: true,
    default: null,
  },
};

// Use in any schema
const TimelineSchema = new Schema({
  title: String,
  content: String,
  celebrity: { type: Schema.Types.ObjectId, ref: "Celebrity" },
  ...moderationFields,  // ✅ Spread the moderation fields
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  moderationFields,
  MODERATION_STATES,
};
```

---

This design is **simple, clean, production-safe, and audit-ready**.

Happy building 🚀