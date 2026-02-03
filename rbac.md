# RBAC (Role Based Access Control) – Complete Guide (WeFans)

This document explains the **complete, correct, and scalable RBAC architecture** for WeFans.
It is written so that **future you or any developer** can understand *what to build, why it exists, and how to extend it safely*.

---

## 1. Core Philosophy (Must Read)

> **Privileges define WHAT actions exist in the system**  
> **Roles define HOW privileges are grouped**  
> **Users only get access via roles**

This separation is the foundation of a secure system.

---

## 2. Static vs Dynamic – Clear Separation

### Static (System-Controlled)
These are **defined in code** and rarely change.

- Privileges (actions)
- System roles
  - `super_admin`
  - `admin`

Static means:
- Not created by users
- Not editable from UI
- Seeded into database

---

### Dynamic (Admin-Controlled)
These are created at runtime.

- Custom roles (moderator, support, etc)
- Role → privilege mappings
- User → role assignments

Dynamic means:
- Created via admin panel
- Fully configurable
- No code change needed

---

## 3. Privileges (Actions) – Centralised & Static

### What is a Privilege?
A privilege represents **one action the system allows**.

Examples:
- `CREATE_ROLE`
- `ASSIGN_ROLE`
- `BAN_USER`
- `VIEW_REVENUE`
- `DELETE_POST`

### Rules
- Privileges are **system contracts**
- They are **static constants in code**
- Users/admins **cannot create new privileges**

---

## 4. Privilege Seeding (Code → Database)

### Why Seed?
The database must mirror **all system actions**.

### Seeding Rules
- Run on deployment
- Idempotent (safe to run multiple times)
- Adds missing privileges only

### Seeding Logic
```
FOR each privilege IN PRIVILEGES:
  IF privilege NOT EXISTS in DB:
     INSERT privilege
```

⚠️ Seeding does NOT reset data.

---

## 5. Roles

### System Roles (Static)

```
super_admin (is_system = true)
admin       (is_system = true)
```

Rules:
- Cannot be deleted
- Cannot be edited by admin
- Hidden from normal users

---

### Dynamic Roles (Admin Created)

Examples:
- moderator
- content_manager
- support

Admin can:
- Create role
- Assign privileges
- Assign role to users

---

## 6. Role → Privilege Mapping

Roles do not contain logic.
They only **reference privileges**.

Example:
```
admin → [CREATE_ROLE, ASSIGN_ROLE, BAN_USER]
moderator → [BAN_USER, DELETE_POST]
```

Super Admin:
- Automatically has **ALL privileges**
- Or uses wildcard `*`

---

## 7. Database Collections (MongoDB)

```
users
roles
privileges
role_privileges
user_roles
```

Relationships:
```
User → Roles → Privileges
```

---

## 8. Login Flow (Runtime Behavior)

1. User logs in
2. Fetch user roles
3. Fetch role privileges
4. Merge into unique privilege list
5. Store in token/session

Token Example:
```
{
  user_id: "123",
  roles: ["admin"],
  privileges: ["CREATE_ROLE", "BAN_USER"]
}
```

---

## 9. Centralised Permission Guard (MOST IMPORTANT)

All access checks go through **one function**.

```
canAccess(user, ACTION):
  IF user.is_super_admin:
     RETURN true
  RETURN ACTION IN user.privileges
```

Benefits:
- One place to change rules
- Entire app updates automatically
- Prevents permission bugs

---

## 10. Backend Enforcement (Security)

Every protected API must check privilege.

Example:
```
POST /roles
  checkPrivilege(CREATE_ROLE)
```

Frontend is NOT trusted.
Backend always enforces rules.

---

## 11. Frontend Behavior (UI Control)

Frontend uses privileges to:
- Show / hide buttons
- Enable / disable pages

Example:
```
IF privileges.includes(CREATE_ROLE):
  show "Create Role" button
```

⚠️ Frontend hides UI only. Backend decides access.

---

## 12. Adding a New Feature (IMPORTANT FLOW)

### Scenario
New feature added: **Export Users**

### Steps
1. Add privilege in code
   ```
   EXPORT_USERS
   ```
2. Run seed script
3. Privilege appears in DB
4. Admin assigns privilege to roles
5. Feature becomes usable

No DB reset required.

---

## 13. Golden Rules (Never Break These)

- Privileges are static
- Roles are dynamic
- Admin cannot touch system roles
- Super admin always has full access
- Backend > Frontend for security
- One central permission guard

---

## 14. Mental Model (Final)

```
Privileges → define power
Roles → group power
Users → receive power
```

---

## 15. Summary (One Line)

> **Change features = change privileges (code)**  
> **Change access = change roles (database)**

This design is scalable, secure, and production-ready.
