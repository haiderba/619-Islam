# Transform “Hubs” into a Habit-Based App — Development Plan

We want to **change the current “Hubs” concept into a “Habits” platform**. Before making changes, inspect the existing codebase and understand the current architecture, authentication, database, UI, notifications, and existing functionality.

**Important:** Do **NOT** push anything to GitHub. Do not commit or push changes unless I explicitly ask you to do so.

## 1. First: Analyze the Existing Project

Before modifying anything:

- Inspect the complete project structure.
- Identify the frontend and backend architecture.
- Understand the existing authentication/login system.
- Review the current “Hubs” functionality and determine what can be reused.
- Review the database schema/models.
- Check the current notification implementation and why notifications are not working.
- Identify existing APIs, services, components, routes, and reusable UI elements.
- Check for existing admin functionality.
- Identify technical debt, bugs, broken functionality, and areas that can be improved.

Do not immediately start rewriting the application. First create a clear implementation plan based on the existing codebase.

---

# 2. Change “Hubs” to “Habits”

The main concept of the application should become **Habits**.

Replace the existing Hub-related terminology and functionality where appropriate.

The application should allow users to:

- Sign up
- Log in
- Log out
- Manage their account/profile
- Browse available habits
- View habit details
- Join a habit
- Leave a habit if appropriate
- See the habits they have joined
- Track their participation/progress where the existing architecture supports it
- Receive notifications related to their habits

### Important Restriction

**Users must NOT be able to create their own habits.**

Only administrators can create and publish habits.

---

# 3. User Authentication System

Create or improve a complete user authentication system.

Users should be able to:

- Sign up
- Log in
- Log out
- Maintain their authenticated session
- Access their profile
- Update appropriate profile information
- Reset/change password if the current architecture supports it
- See their joined habits

Implement proper authentication and authorization rather than simply hiding UI elements.

A normal user must not be able to access admin APIs or perform admin actions by manually calling endpoints.

---

# 4. Admin Panel

Create a dedicated **Admin Panel** with a separate admin login/access system.

Admins should have complete control over the application.

## Admin Dashboard

The dashboard should provide useful statistics such as:

- Total users
- Active users
- Total habits
- Active habits
- Total habit memberships/joins
- Recent users
- Recently created habits
- Other useful metrics

Keep the dashboard simple, clean, and useful.

---

# 5. Habit Management for Admins

Admins should have complete CRUD functionality for habits.

Admins can:

### Create Habit

Create a habit with fields such as:

- Habit name/title
- Description
- Cover image/icon if supported
- Category
- Goal
- Frequency
- Duration
- Start/end date if applicable
- Status
- Visibility
- Other fields required by the existing application

### Edit Habit

Admins can update any relevant habit information.

### Delete Habit

Admins can delete habits with appropriate confirmation.

If deleting a habit could affect users who already joined it, handle this safely rather than blindly deleting related data.

### Activate/Deactivate Habit

Admins should be able to control whether a habit is currently available to users.

### View Participants

Admins should be able to see:

- Users who joined each habit
- Number of participants
- Relevant participation information

---

# 6. User Management for Admin

The admin panel should include a complete user management section.

Admins should be able to:

- View all users
- Search users
- Filter users
- View user details
- See which habits a user has joined
- Activate/deactivate users where appropriate
- Manage user roles/permissions
- Delete users if required by the existing system
- View account/activity information where available

Make sure role-based access control is properly implemented.

At minimum, support:

- `Admin`
- `User`

A normal user must never be able to access admin functionality through the frontend or API.

---

# 7. User Habit Experience

The normal user experience should remain simple.

The main flow should be:

**Sign Up / Login → Browse Habits → Open Habit → Join Habit → Track/View Joined Habits**

Users should have a clean dashboard where they can see:

- Available habits
- Habits they have joined
- Active habits
- Progress/status where applicable
- Notifications

The UI should be intuitive and avoid unnecessary complexity.

---

# 8. Notifications — Fix Completely

The existing notification system is currently **not working**.

Investigate the existing implementation and determine why notifications are failing.

Do not simply hide or remove the notification feature.

Check:

- Backend notification logic
- Database/storage
- Notification API endpoints
- Frontend notification state
- API requests
- Authentication
- Permissions
- Push notification configuration
- Browser/device permissions
- Notification service workers if applicable
- Token registration
- Error handling
- Background delivery
- Read/unread state

Fix the root cause.

After fixing, test the complete notification flow.

For example:

**Admin creates/publishes habit → relevant users receive notification**

Also consider notifications for:

- New habit published
- User successfully joins a habit
- Habit updates
- Important habit reminders
- Admin announcements where appropriate

Use the notification technology already present in the project where possible instead of unnecessarily introducing a completely new system.

---

# 9. UI/UX Improvements

While implementing the above functionality, improve the application UI where necessary.

The design should feel:

- Modern
- Clean
- Simple
- Consistent
- Responsive
- Mobile-friendly
- Easy to navigate

Improve:

- Navigation
- Dashboard
- Forms
- Empty states
- Loading states
- Error messages
- Success messages
- Confirmation dialogs
- Tables
- Cards
- Habit detail pages
- Admin interface
- Mobile responsiveness

Do not overcomplicate the interface.

Reuse the existing design system/components where possible.

---

# 10. Backend & Security

Make sure the implementation is secure and production-ready.

Implement proper:

- Authentication
- Authorization
- Role-based access control
- API validation
- Input validation
- Error handling
- Database relationships
- Permission checks
- Secure admin endpoints

Do not rely only on frontend restrictions.

For example, even if the "Create Habit" button is hidden from a normal user, the backend must also reject a normal user's request to create a habit.

---

# 11. Database & Data Migration

Before changing existing models/tables, understand the current database structure.

Determine whether the existing “Hubs” data can be safely migrated into the new “Habits” structure.

Do not destroy existing user data unnecessarily.

If migration is required:

- Create appropriate migrations.
- Preserve existing users where possible.
- Preserve relationships where possible.
- Clearly document any unavoidable data changes.

---

# 12. Testing

After implementation, test the complete system.

## User Testing

Test:

- Sign up
- Login
- Logout
- Profile
- Browse habits
- View habit
- Join habit
- View joined habits
- Notifications
- Unauthorized admin access

## Admin Testing

Test:

- Admin login
- Dashboard
- User management
- Create habit
- Edit habit
- Delete habit
- Activate/deactivate habit
- View participants
- Admin authorization

## Security Testing

Verify:

- Normal users cannot create habits.
- Normal users cannot access admin pages.
- Normal users cannot call admin APIs successfully.
- Unauthorized users cannot access protected endpoints.
- Admin-only actions are protected on the backend.

## Responsive Testing

Check:

- Desktop
- Tablet
- Mobile

---

# 13. Code Quality

While making the changes:

- Follow the existing project's architecture and conventions.
- Avoid unnecessary rewrites.
- Reuse existing components/services.
- Remove obsolete Hub-specific code where appropriate.
- Keep the code modular and maintainable.
- Avoid duplicate logic.
- Add proper error handling.
- Keep API responses consistent.
- Do not introduce unnecessary dependencies.

---

# 14. Development Process

Follow this process strictly:

### Phase 1 — Inspect

Analyze the existing project and identify:

- Architecture
- Current functionality
- Authentication
- Database
- Hubs implementation
- Notifications
- Admin functionality
- Problems/bugs

### Phase 2 — Plan

Before making major changes, provide me with:

1. Current architecture summary
2. Problems discovered
3. Proposed architecture
4. Database/model changes
5. API changes
6. Frontend changes
7. Admin panel structure
8. Notification fix strategy
9. Migration strategy
10. Testing plan

### Phase 3 — Implement

After the plan is established, implement the changes systematically.

Do not make unrelated changes.

### Phase 4 — Test

Run the available:

- Unit tests
- Integration tests
- Build checks
- Linting
- Type checks
- API tests

Fix errors that are introduced by the implementation.

### Phase 5 — Final Review

Before considering the work complete, review:

- Authentication
- Authorization
- Admin security
- Habit CRUD
- User management
- Notifications
- UI/UX
- Mobile responsiveness
- Database integrity
- Error handling

---

# 15. GitHub Instruction — VERY IMPORTANT

**DO NOT PUSH ANYTHING TO GITHUB.**

Do not:

- Push changes
- Create a PR
- Merge anything
- Publish anything

You may inspect the existing GitHub repository if necessary, but all implementation work should remain local.

When the implementation is complete, stop and report the changes to me.

**Only push to GitHub when I explicitly tell you to push.**

---

# Expected Final Result

The application should become a simple **Habit Management Platform** with two clearly separated experiences.

## User

**Sign Up / Login → Browse Habits → Join Habit → Track/View Habits → Receive Notifications**

## Admin

**Admin Login → Dashboard → Manage Users → Create/Edit/Delete Habits → Manage Participants → Manage Notifications/Announcements**

The system should be secure, clean, responsive, easy to maintain, and should reuse as much of the existing project as practical.

**Start by inspecting the existing codebase and come back with the implementation plan first. Do not start pushing anything to GitHub.**
