# Admin Panel for BaseCamp Digital

## Context

Currently, courses are created/managed only via raw SQL in the Supabase dashboard. Much of the course detail page content is hardcoded. There is no admin role, no image upload, and no way for non-technical admins to manage content. This plan creates a **completely hidden** admin panel at `/admin` — not linked anywhere in the UI, no admin sign-up, non-admins silently redirected away. It also adds "Forgot Password" to both normal and admin login flows.

---

## Phase 1: Database Migrations (run in Supabase SQL Editor)

### 1a. Add admin role to profiles
- Add `is_admin BOOLEAN DEFAULT FALSE` to `profiles`
- Create `is_admin()` SQL helper function
- **Manually** set `is_admin = true` for Parth's user in Supabase dashboard (master admin)
- No admin sign-up exists — new admins are created only by manually setting `is_admin = true` in Supabase

### 1b. Add dynamic content columns + tables
- Add to `courses`: `instructor_bio`, `category`, `language`, `subtitle_languages`, `original_price`, `price_usd`, `original_price_usd` (all nullable/defaulted)
- Create `course_learning_points` (id, course_id, text, order_index)
- Create `course_requirements` (id, course_id, text, order_index)
- Create `course_includes` (id, course_id, icon, text, order_index)
- Create `coupons` (id, code, discount_percent, course_id, is_active, max_uses, uses_count, expires_at)

### 1c. RLS policies
- Courses/sections/lessons: public SELECT for published, admin full CRUD
- New tables: public SELECT, admin full CRUD
- Coupons: admin-only access (public validates via API route)

### 1d. Supabase Storage bucket
- Create `course-assets` bucket (public read)
- Admin-only upload/update/delete policies

### 1e. Seed existing hardcoded content
- Insert the 8 "What you'll learn" items for the AI course into `course_learning_points`
- Insert the 3 requirements into `course_requirements`
- Insert the 6 "course includes" items into `course_includes`
- Insert the 4 coupon codes into `coupons`
- Update AI course: set `original_price = 9999`, `category = 'Artificial Intelligence'`

**SQL scripts:** `scripts/003_add_admin_role.sql` through `scripts/007_seed_dynamic_content.sql`

---

## Phase 2: Auth & Access Control

### Admin access rules:
- `/admin/login` — Dedicated admin login page (email + password only, NO sign-up link, NO link to normal site login)
- `/admin/*` (all other admin pages) — Requires authenticated user with `is_admin = true`
- Non-admin visiting `/admin` → silently redirected to `/`
- Non-logged-in visiting `/admin` → redirected to `/admin/login`
- Admin accounts created **only** by master admin manually (via Supabase dashboard → set `is_admin = true`)
- No admin sign-up page exists

### Forgot Password (both normal + admin):
- Add "Forgot Password?" link to **`app/auth/login/page.tsx`** (existing user login)
- Create **`app/auth/forgot-password/page.tsx`** — email input → calls `supabase.auth.resetPasswordForEmail()` → shows confirmation
- Create **`app/auth/reset-password/page.tsx`** — new password form (user lands here from email link) → calls `supabase.auth.updateUser({ password })`
- Admin login page at `/admin/login` also has "Forgot Password?" linking to same `/auth/forgot-password` flow (Supabase uses same auth system for all users)

### Files to modify:
- **`lib/types.ts`** — Add `is_admin` to Profile, add new Course/Coupon interfaces
- **`lib/supabase/middleware.ts`** — Add admin route protection:
  - `/admin/login` → allow always (it's the admin login page)
  - `/admin/*` → check auth + `is_admin`, redirect to `/` if non-admin, redirect to `/admin/login` if not logged in
- **`app/auth/login/page.tsx`** — Add "Forgot Password?" link

### Files to create:
- **`lib/admin.ts`** — `requireAdmin()` helper (defense-in-depth check in server components)
- **`app/admin/login/page.tsx`** — Minimal admin login page (email + password, no sign-up, "Forgot Password?" link)
- **`app/auth/forgot-password/page.tsx`** — Enter email to receive reset link
- **`app/auth/reset-password/page.tsx`** — Enter new password (from email link)

---

## Phase 3: Admin Shell (Layout + Dashboard)

### Files to create:
- **`app/admin/layout.tsx`** — Server component; calls `requireAdmin()`; renders sidebar + content area (completely separate from main site — no Navbar/Footer)
- **`components/admin/admin-sidebar.tsx`** — Sidebar nav: Dashboard, Courses, Coupons. Uses existing `components/ui/sidebar.tsx`
- **`app/admin/page.tsx`** — Dashboard with stats cards (total courses, enrollments, users)

---

## Phase 4: Course CRUD

### Files to create:
- **`components/admin/image-upload.tsx`** — File input → preview → upload to Supabase Storage `course-assets` bucket → returns public URL
- **`components/admin/course-form.tsx`** — Tabbed form (Basic Info, Pricing, Instructor, Media, Content, Settings) using `react-hook-form` + `zod`. Handles both create and edit modes
- **`app/admin/courses/actions.ts`** — Server Actions: `createCourse`, `updateCourse`, `deleteCourse`, `updateCourseLearningPoints`, `updateCourseRequirements`, `updateCourseIncludes`
- **`app/admin/courses/page.tsx`** — Table of all courses with thumbnail, title, price, type, published status, edit/delete actions
- **`app/admin/courses/new/page.tsx`** — Create course page (renders CourseForm)
- **`app/admin/courses/[id]/page.tsx`** — Edit course page (renders CourseForm with existing data)

---

## Phase 5: Section & Lesson Management

### Files to create:
- **`app/admin/courses/[id]/sections/page.tsx`** — Section list with expandable lessons inside each
- **`app/admin/courses/[id]/sections/actions.ts`** — Server Actions: `createSection`, `updateSection`, `deleteSection`, `reorderSections`, `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`
- **`components/admin/section-manager.tsx`** — Sections with move up/down buttons, inline edit, delete. Each section expands to show its lessons
- **`components/admin/lesson-form-dialog.tsx`** — Dialog form for lesson: title, description, vimeo_video_id, duration_minutes, is_preview toggle

---

## Phase 6: Coupon Management

### Files to create:
- **`app/admin/coupons/page.tsx`** — Table of coupons with create/edit/delete/toggle
- **`app/admin/coupons/actions.ts`** — Server Actions: `createCoupon`, `updateCoupon`, `deleteCoupon`, `toggleCouponActive`
- **`components/admin/coupon-form-dialog.tsx`** — Dialog form for coupon
- **`app/api/coupons/validate/route.ts`** — Public API endpoint to validate a coupon code + course_id

---

## Phase 7: Make Frontend Dynamic

### Files to modify:
- **`app/courses/[slug]/page.tsx`** — Fetch `course_learning_points`, `course_requirements`, `course_includes` from DB; pass as props to client
- **`app/courses/[slug]/course-detail-client.tsx`** — Remove hardcoded arrays (`whatYouWillLearn`, `courseIncludes`, requirements, `VALID_COUPONS`, breadcrumb, instructor bio, prices). Accept dynamic props instead. Use `course.original_price` for pricing. Call `/api/coupons/validate` for coupon validation
- **`components/course-card.tsx`** — Use `course.original_price` instead of hardcoded `ORIGINAL_PRICE` constant

---

## Verification Plan

1. **Admin access:** Log in as Parth → navigate to `/admin` → should see the dashboard
2. **Non-admin block:** Log in as a regular user → navigate to `/admin` → silently redirected to `/`
3. **Unauthenticated block:** Not logged in → navigate to `/admin` → redirected to `/admin/login`
4. **No admin sign-up:** `/admin/login` has NO sign-up link — only email/password + forgot password
5. **Forgot password (user):** `/auth/login` → click "Forgot Password?" → enter email → receive reset email → reset password at `/auth/reset-password`
6. **Forgot password (admin):** `/admin/login` → click "Forgot Password?" → same flow via `/auth/forgot-password`
7. **Course CRUD:** Create a new test course with image upload → verify it appears on the public site. Edit → verify. Delete → verify
8. **Section/Lesson management:** Add sections and lessons → verify they show in curriculum accordion
9. **Coupons:** Create coupon in admin → apply on course detail page → verify discount
10. **Dynamic content:** Verify AI course "What you'll learn", requirements, includes load from DB
11. **Crash course:** Create free course in admin (price=0) → verify it appears under "Crash Courses"

---

## New File Summary (22 files)

| File | Purpose |
|------|---------|
| `scripts/003-007_*.sql` | 5 SQL migration scripts |
| `lib/admin.ts` | requireAdmin helper |
| `app/admin/login/page.tsx` | **Admin-only login** (no sign-up, no link from main site) |
| `app/admin/layout.tsx` | Admin shell layout (separate from main site) |
| `app/admin/page.tsx` | Admin dashboard |
| `app/admin/courses/page.tsx` | Course list |
| `app/admin/courses/new/page.tsx` | Create course |
| `app/admin/courses/[id]/page.tsx` | Edit course |
| `app/admin/courses/[id]/sections/page.tsx` | Section/lesson manager |
| `app/admin/courses/actions.ts` | Course server actions |
| `app/admin/courses/[id]/sections/actions.ts` | Section/lesson server actions |
| `app/admin/coupons/page.tsx` | Coupon management |
| `app/admin/coupons/actions.ts` | Coupon server actions |
| `app/api/coupons/validate/route.ts` | Public coupon validation API |
| `app/auth/forgot-password/page.tsx` | **Forgot password** — enter email |
| `app/auth/reset-password/page.tsx` | **Reset password** — new password form |
| `components/admin/admin-sidebar.tsx` | Admin sidebar nav |
| `components/admin/course-form.tsx` | Course create/edit form |
| `components/admin/section-manager.tsx` | Section CRUD UI |
| `components/admin/lesson-form-dialog.tsx` | Lesson form dialog |
| `components/admin/image-upload.tsx` | Image upload to Supabase Storage |
| `components/admin/coupon-form-dialog.tsx` | Coupon form dialog |

## Existing Files Modified (6 files)

| File | Change |
|------|--------|
| `lib/types.ts` | Add `is_admin` to Profile, new interfaces |
| `lib/supabase/middleware.ts` | Protect `/admin/*`, allow `/admin/login` |
| `app/auth/login/page.tsx` | Add "Forgot Password?" link |
| `app/courses/[slug]/page.tsx` | Fetch dynamic content from new tables |
| `app/courses/[slug]/course-detail-client.tsx` | Replace hardcoded content with dynamic props |
| `components/course-card.tsx` | Use `course.original_price` |
