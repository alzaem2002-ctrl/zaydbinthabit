# School Performance Documentation System
## نظام توثيق شواهد الأداء الوظيفي

### Current Status: ✅ COMPLETE & FUNCTIONAL

The application is fully implemented with complete frontend, backend, database, authentication, and multi-role signature approval system.

---

## What Was Built

### ✅ Complete Features Implemented:

1. **Authentication System**
   - Replit OAuth integration (Google, GitHub, Email)
   - Session management with PostgreSQL session store
   - Token refresh and expiration handling
   - Protected routes and API endpoints
   - Role-based access control (Teacher/Principal)

2. **Database Layer**
   - 10 tables: users, sessions, indicators, criteria, witnesses, strategies, userStrategies, capabilities, changes, signatures
   - PostgreSQL with Neon serverless
   - Drizzle ORM with TypeScript types
   - 18 strategies, 12 capabilities, 12 changes pre-seeded

3. **Multi-Role System**
   - **Creator Role** (منشئ الموقع): Site-wide user management, assign any role to users, all principal permissions
   - **Principal/Admin Role**: View all teachers, approve/reject indicators, school-wide statistics
   - **Supervisor Role**: Future expansion for department oversight
   - **Teacher Role**: Create indicators, manage criteria, add witnesses, submit for approval
   - Role hierarchy: creator > admin > supervisor > teacher
   - Automatic role-based routing
   - Data isolation between teachers

4. **Signature Approval Workflow**
   - Teachers submit completed indicators for principal approval
   - Status tracking: pending → approved/rejected
   - Principal can add approval notes
   - Rejection requires reason

5. **Frontend Application**
   - Landing page (non-authenticated users)
   - Teacher dashboard (/home)
   - Principal dashboard (/principal)
   - Indicator management (CRUD operations)
   - Witness/evidence management
   - Strategies selection interface
   - Full RTL Arabic interface
   - Light/dark theme toggle
   - Responsive design

6. **Backend API**
   - 20+ REST endpoints
   - Stats aggregation for both roles
   - Indicator CRUD with criteria tracking
   - Signature management
   - Principal-only protected endpoints
   - User profile management

---

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite build system
- Wouter routing
- TanStack Query for state
- Shadcn UI components
- Tailwind CSS + RTL support

**Backend:**
- Express.js + TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Passport.js for auth
- isPrincipal middleware for role checks

**Design:**
- Arabic RTL layout
- Material Design adapted
- Cairo/Tajawal fonts
- Light/dark modes
- Professional educational theme

---

## How to Use

### For Teachers

1. **Login**
   - Click "تسجيل الدخول" on landing page
   - Authenticate via Replit auth
   - Redirected to teacher dashboard

2. **Add Indicators**
   - Click "إضافة مؤشر جديد"
   - Enter title, description, criteria
   - View on dashboard

3. **Complete Indicators**
   - Click on indicator to expand
   - Check criteria as completed
   - Status changes to "مكتمل" when all criteria done

4. **Submit for Approval**
   - Click "تقديم للاعتماد" on completed indicators
   - Status changes to "قيد الانتظار"
   - Wait for principal review

5. **Manage Witnesses**
   - Click "إضافة شاهد" on any indicator
   - Add evidence/documentation

### For Principals

1. **Access Dashboard**
   - Login with principal account (role=admin)
   - Automatically redirected to /principal

2. **View School Statistics**
   - Total teachers, indicators, pending approvals
   - School-wide performance overview

3. **Review Teacher Work**
   - Browse teacher list
   - View individual teacher indicators
   - See completion status

4. **Approve/Reject Indicators**
   - Click on pending signatures
   - Review indicator details
   - Approve with optional notes
   - Reject with required reason

---

## Project Structure

```
├── client/src/
│   ├── pages/
│   │   ├── landing.tsx       (public landing page)
│   │   ├── home.tsx          (teacher dashboard)
│   │   └── principal.tsx     (principal dashboard)
│   └── components/
│       ├── header.tsx
│       ├── sidebar-profile.tsx
│       ├── *-modal.tsx       (modals)
│       └── ui/               (shadcn components)
├── server/
│   ├── app.ts               (Express setup)
│   ├── routes.ts            (API endpoints)
│   ├── storage.ts           (Database operations)
│   ├── db.ts                (Drizzle connection)
│   └── replitAuth.ts        (Replit OAuth + isPrincipal)
├── shared/
│   └── schema.ts            (Database & types)
└── package.json
```

---

## API Endpoints

### Public
- `GET /api/auth/callback` - OAuth callback

### Teacher Endpoints
- `GET /api/user` - Current user
- `PATCH /api/user` - Update profile
- `GET /api/stats` - Dashboard statistics
- `GET /api/indicators` - User's indicators
- `POST /api/indicators` - Create indicator
- `PATCH /api/indicators/:id/criteria/:id` - Toggle criterion
- `POST/GET /api/indicators/:id/witnesses` - Witness management
- `GET/POST /api/user-strategies` - Strategy selection
- `POST /api/signatures` - Submit for approval
- `GET /api/my-signatures` - View submission status

### Principal Endpoints (Protected)
- `GET /api/principal/stats` - School statistics
- `GET /api/principal/teachers` - All teachers list
- `GET /api/principal/teachers/:id/indicators` - Teacher's indicators
- `GET /api/principal/pending-signatures` - Pending approvals
- `POST /api/principal/signatures/:id/approve` - Approve indicator
- `POST /api/principal/signatures/:id/reject` - Reject indicator

---

## Role-Based Routing

```typescript
// App.tsx routing logic
if (user?.role === "admin") {
  redirect to /principal
} else {
  redirect to /home
}
```

---

## Data Isolation

- Teachers can only view/edit their own indicators
- Teachers can only submit their own indicators for approval
- Signatures are linked to specific teacher-indicator pairs
- Principal can view all teachers but cannot modify their data

---

## Deployment

The application is ready to publish with `npm run build` and will be available at a Replit app URL.

To deploy:
1. Click Publish in Replit
2. App will be hosted with TLS
3. Database will be automatically managed

---

**Status:** ✅ Ready for Production
**Last Updated:** November 27, 2025
**Language:** Arabic (RTL)
**Audience:** Teachers, Principals, School Administrators
**Footer Credit:** الصفحة من إعداد عبدالعزيز الخلفان
