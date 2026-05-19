================================================================================
SEWAMICS ADMIN DASHBOARD - COMPLETE SYSTEM ARCHITECTURE
================================================================================
Project: SewaMics Admin Dashboard (Web)
Tech Stack: Vite + React 19 + TypeScript + Tailwind CSS + Firestore
Status: Phase 2.1 - Ready for Implementation
Generated: 2025-05-19
================================================================================

TABLE OF CONTENTS
================================================================================
1. Project Overview & Scope
2. Technology Stack & Dependencies
3. Firestore Data Schema (Admin Collections)
4. Authentication Flow (Email + OTP via EmailJS)
5. Admin Roles & Access Control (RBAC)
6. Project Directory Structure
7. Core Services Architecture
8. Component Hierarchy & Reusable Components
9. State Management Strategy (Context + React Query)
10. Routing & Protected Routes
11. UI/UX Design System (Brand Identity)
12. Module-by-Module Implementation Guide
13. Firestore Security Rules Summary
14. Product Image Upload Flow (Firebase Storage)
15. Error Handling & Loading States
16. Performance Optimization
17. Development Workflow & Best Practices
18. Deployment Checklist

================================================================================
1. PROJECT OVERVIEW & SCOPE
================================================================================

PROJECT NAME: SewaMics Admin Dashboard
TYPE: Web-based Admin Management System
USERS: Admin staff (3 role tiers)
PRIMARY GOAL: Manage e-commerce operations (products, orders, customers, settings)

CORE FEATURES:
- Email + OTP authentication (via EmailJS)
- Role-based access control (RBAC) - 3 roles
- Dashboard with analytics & charts
- Product inventory management (CRUD + image uploads)
- Order management (listing, details, status updates)
- Customer management (profiles, order history)
- Admin account management (Super Admin only)
- Settings & store configuration
- Activity logs (immutable audit trail)
- Sales reports (weekly, monthly, annual with export)

EXCLUSIONS:
- Google Sign-In (Email + OTP only)
- Admin profile pictures
- Chatbot/AI features
- Email notifications (yet)
- SMS notifications
- Refund processing

================================================================================
2. TECHNOLOGY STACK & DEPENDENCIES
================================================================================

CORE FRAMEWORK:
- Vite 5.x (build tool, fast HMR)
- React 19.x (UI library, hooks, server components)
- TypeScript 5.x (type safety, IDE support)
- React Router DOM 6.x (routing, protected routes)

STATE & DATA MANAGEMENT:
- @tanstack/react-query 5.x (async data fetching, caching)
- React Context API (auth state, role-based context)
- Zustand 4.x (lightweight global state, optional)

STYLING & UI:
- Tailwind CSS 3.x (utility-first CSS framework)
- Lucide React 0.x (icon library, 400+ icons)
- React Hook Form 7.x (form validation)
- Zod 3.x (schema validation for forms)

CHARTING & DATA VISUALIZATION:
- Recharts 2.x (line, bar, pie charts)
- date-fns 2.x (date manipulation, formatting)

FIREBASE & BACKEND:
- Firebase 10.12.0 (core SDK)
  - firebaseAuth (user authentication)
  - firebaseFirestore (NoSQL database)
  - firebaseStorage (file storage for product images)
- @firebase/app 0.x
- @firebase/auth 0.x
- @firebase/firestore 0.x
- @firebase/storage 0.x

EXTERNAL SERVICES:
- EmailJS (OTP email delivery)
- @emailjs/browser 4.x (EmailJS SDK)

UTILITIES & HELPERS:
- axios 1.x (HTTP requests, optional)
- clsx 2.x (conditional className utility)
- tailwind-merge 2.x (merge Tailwind classes safely)

DEVELOPMENT TOOLS:
- @types/react 19.x (React type definitions)
- @types/node 20.x (Node type definitions)
- @vitejs/plugin-react 4.x (Vite React plugin)
- ESLint 8.x (code linting)
- Prettier 3.x (code formatting)
- TypeScript ESLint (TypeScript linting)

OPTIONAL (For future enhancement):
- Zustand (state management, if needed)
- TanStack Table (advanced data tables)
- Framer Motion (animations)
- React PDF (report PDF generation)

================================================================================
3. FIRESTORE DATA SCHEMA (ADMIN COLLECTIONS)
================================================================================

COLLECTION 1: /admins
Document ID: adminID (UID from Firebase Auth)
├── email (string) - Unique admin email, indexed
├── name (string) - Full name of admin
├── role (string) - Enum: 'super_admin' | 'inventory_manager' | 'order_manager'
├── status (string) - Enum: 'active' | 'inactive'
├── lastLogin (timestamp, nullable) - Last authentication time
├── createdAt (timestamp) - Account creation time
├── createdBy (string) - UID of creator (Super Admin)
├── updatedAt (timestamp, nullable) - Last update time
├── preferences (object, optional)
│   ├── theme (string) - 'light' | 'dark'
│   └── emailNotifications (boolean) - Enable/disable alerts
└── permissions (array, generated from role)

COLLECTION 2: /activityLogs
Document ID: logId (auto-generated)
├── adminID (string) - UID of admin performing action
├── adminName (string) - Display name for audit trail
├── action (string) - Enum: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
├── module (string) - Enum: 'products' | 'orders' | 'admins' | 'settings' | 'auth'
├── targetId (string) - ID of affected document (product, order, etc.)
├── targetName (string, optional) - Name of affected item (product name, etc.)
├── description (string) - Human-readable action description
├── timestamp (timestamp) - When action occurred
├── oldValues (object, nullable) - Previous state (for updates)
├── newValues (object, nullable) - New state (for updates/creates)
├── ipAddress (string, optional) - Client IP for security audit
└── userAgent (string, optional) - Browser/client info

COLLECTION 3: /settings
Document ID: storeConfig (singleton document)
├── storeInfo (map)
│   ├── storeName (string) - Business name
│   ├── storeEmail (string) - Contact email
│   ├── storePhone (string) - Contact phone
│   ├── storeAddress (string) - Physical address
│   ├── storeDescription (string, optional) - About the store
│   └── updatedAt (timestamp) - Last config update
├── paymentMethods (array of maps)
│   └── [0] (map)
│       ├── name (string) - "Stripe Card"
│       ├── isActive (boolean) - Payment method availability
│       ├── type (string) - "card"
│       └── config (map, optional)
│           └── apiVersion (string) - Stripe API version
├── businessHours (map, optional)
│   ├── openTime (string) - "09:00"
│   └── closeTime (string) - "17:00"
└── globalSettings (map, optional)
    ├── allowUserRegistration (boolean)
    ├── maintenanceMode (boolean)
    └── currencyCode (string) - "PHP"

COLLECTION 4: /reportCache
Document ID: reportId (auto-generated)
├── reportType (string) - Enum: 'weekly' | 'monthly' | 'annual'
├── period (string) - Formatted period: "2025-W01", "2025-01", "2025"
├── startDate (timestamp) - Report period start
├── endDate (timestamp) - Report period end
├── data (map)
│   ├── totalOrders (number) - Count of orders in period
│   ├── totalRevenue (number) - Sum of order totals
│   ├── averageOrderValue (number) - totalRevenue / totalOrders
│   ├── medianOrderValue (number) - Median order amount
│   ├── topProducts (array of maps)
│   │   ├── [0...19] (map)
│   │   │   ├── productId (string)
│   │   │   ├── name (string)
│   │   │   ├── category (string)
│   │   │   ├── quantity (number) - Units sold
│   │   │   └── revenue (number) - Total revenue from product
│   ├── ordersByStatus (map)
│   │   ├── pending (number)
│   │   ├── processing (number)
│   │   ├── shipped (number)
│   │   ├── delivered (number)
│   │   └── cancelled (number)
│   ├── breakdown (array of maps) - Time-series breakdown
│   │   ├── [0...52] (map, for weekly)
│   │   │   ├── period (string) - "Mon", "2025-W01", "Jan", etc.
│   │   │   ├── revenue (number)
│   │   │   ├── orders (number)
│   │   │   └── date (timestamp)
│   ├── categoryBreakdown (array of maps)
│   │   ├── [0...n] (map)
│   │   │   ├── category (string)
│   │   │   ├── revenue (number)
│   │   │   └── percentage (number)
│   └── growthRate (number, nullable) - % growth vs previous period
├── generatedAt (timestamp) - Report generation time
├── generatedBy (string) - UID of admin who generated
├── expiresAt (timestamp) - Cache expiration (7 days for weekly, 30 for monthly)
└── isActive (boolean) - Flag for active/archived reports

REFERENCED COLLECTIONS (from mobile, read-only for admin):
- /products - Product catalog (admin can edit)
- /orders - Customer orders (admin can view/update status)
- /users - Customer profiles (admin can view, order managers only)

================================================================================
4. AUTHENTICATION FLOW (EMAIL + OTP VIA EMAILJS)
================================================================================

STEP 1: LOGIN PAGE
┌─────────────────────────────────────────────────────────┐
│ User visits /login                                      │
│ - Form with email input                                 │
│ - "Send OTP" button                                     │
│ - Design: Berry pink CTA button, Zalando typography    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
STEP 2: OTP REQUEST
┌─────────────────────────────────────────────────────────┐
│ User enters email & clicks "Send OTP"                   │
│ - Validate email format (Zod schema)                    │
│ - Check if email exists in /admins collection           │
│ - Generate 6-digit OTP                                  │
│ - Store OTP in memory with 10-min expiration            │
│ - Send OTP via EmailJS (admin template)                 │
│ - Display: "OTP sent to your email"                     │
│ - Disable button for 60 seconds (rate limiting)         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
STEP 3: OTP VERIFICATION PAGE
┌─────────────────────────────────────────────────────────┐
│ User sees OTP input screen                              │
│ - 6 digit input fields (auto-focus between fields)      │
│ - "Verify" button                                       │
│ - "Resend OTP" link (disabled for 60 seconds)           │
│ - Timer countdown (10 minutes)                          │
│ - Design: Orange accent for timer, rounded inputs       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
STEP 4: OTP VALIDATION
┌─────────────────────────────────────────────────────────┐
│ User enters 6-digit OTP & clicks "Verify"               │
│ - Check OTP against stored value in memory              │
│ - Check OTP expiration time                             │
│ - If valid:                                             │
│   - Call Firebase Auth signInWithCustomToken()          │
│   - Create JWT session (HttpOnly cookie, optional)      │
│   - Fetch admin role from /admins/{uid}                 │
│   - Store role in Context (AuthContext)                 │
│   - Redirect to /dashboard                              │
│ - If invalid:                                           │
│   - Show error: "Invalid OTP"                           │
│   - Allow retry up to 3 times                           │
│   - Lock for 30 seconds after 3 failed attempts         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
STEP 5: SESSION MANAGEMENT
┌─────────────────────────────────────────────────────────┐
│ User authenticated & logged in                          │
│ - Store user UID in Context                             │
│ - Store admin role (super_admin, inventory_manager,     │
│   order_manager) in Context                             │
│ - Store email in Context                                │
│ - Start 30-minute inactivity timer                      │
│ - User can now access dashboard                         │
│ - Every API call includes Firebase Auth token           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
STEP 6: SESSION TIMEOUT
┌─────────────────────────────────────────────────────────┐
│ If no activity for 30 minutes:                          │
│ - Clear Context (logout)                                │
│ - Clear Firebase Auth session                           │
│ - Clear localStorage                                    │
│ - Redirect to /login                                    │
│ - Show: "Session expired, please log in again"          │
│                                                         │
│ On logout button click:                                 │
│ - Log activity: { action: 'LOGOUT', module: 'auth' }    │
│ - Clear all auth data                                   │
│ - Redirect to /login                                    │
└─────────────────────────────────────────────────────────┘

EMAILJS CONFIGURATION:
├── Service ID: (same as mobile client setup)
├── Template ID: (new admin-specific template)
├── Public Key: (from environment variables)
└── Email Template Variables:
    ├── to_email (recipient admin email)
    ├── to_name (admin name)
    ├── otp_code (6-digit code)
    ├── otp_expiry (10 minutes)
    └── support_email (store support email)

SECURITY MEASURES:
✓ OTP stored in-memory (not persisted)
✓ OTP expires after 10 minutes
✓ Max 3 failed attempts before 30-sec lockout
✓ Rate limiting: max 5 OTP requests per 10 minutes per email
✓ Email validation before OTP generation
✓ Admin email must exist in /admins collection
✓ All auth events logged to /activityLogs

================================================================================
5. ADMIN ROLES & ACCESS CONTROL (RBAC)
================================================================================

ROLE 1: SUPER ADMIN
├── Full system access
├── Permissions:
│   ├── ✅ Create, edit, delete products
│   ├── ✅ View all orders, update order status
│   ├── ✅ View all customers
│   ├── ✅ Create, edit, delete admin accounts
│   ├── ✅ Edit store settings
│   ├── ✅ View activity logs
│   ├── ✅ Generate and export all reports
│   ├── ✅ View dashboard with full analytics
│   ├── ✅ Change own password
│   └── ✅ Manage admin preferences
└── Module Access: All 8 modules

ROLE 2: INVENTORY MANAGER
├── Product management focus
├── Permissions:
│   ├── ✅ Create, edit, delete products (including images)
│   ├── ✅ View dashboard (limited analytics - products only)
│   ├── ✅ Generate and access reports (product-focused)
│   ├── ✅ View own profile
│   ├── ✅ Change own password
│   ├── ❌ Cannot view/manage orders
│   ├── ❌ Cannot view customers
│   ├── ❌ Cannot manage admin accounts
│   ├── ❌ Cannot edit store settings
│   └── ❌ Cannot view activity logs
└── Module Access: Products, Dashboard (limited), Reports, Profile

ROLE 3: ORDER MANAGER
├── Order & customer management focus
├── Permissions:
│   ├── ✅ View all orders
│   ├── ✅ Update order status only (pending → processing → shipped → delivered)
│   ├── ✅ View customer profiles
│   ├── ✅ View dashboard (limited analytics - orders only)
│   ├── ✅ Generate and access reports (order-focused)
│   ├── ✅ View own profile
│   ├── ✅ Change own password
│   ├── ❌ Cannot manage products
│   ├── ❌ Cannot manage admin accounts
│   ├── ❌ Cannot edit store settings
│   └── ❌ Cannot view activity logs
└── Module Access: Orders, Customers, Dashboard (limited), Reports, Profile

IMPLEMENTATION STRATEGY:
┌────────────────────────────────────────────────────────┐
│ RoleContext (React Context)                            │
│ ├── currentRole: 'super_admin' | 'inventory_manager' | │
│ │               'order_manager'                        │
│ ├── permissions: ['products:create', 'orders:read'...] │
│ ├── canAccess(module): boolean                         │
│ └── hasPermission(action): boolean                     │
└────────────────────────────────────────────────────────┘

ProtectedRoute Component:
- Wraps route definitions
- Checks currentRole against required role
- Redirects to /unauthorized if access denied
- Shows 403 error page

Example Usage:
<ProtectedRoute 
  path="/inventory" 
  element={<InventoryPage />}
  requiredRoles={['super_admin', 'inventory_manager']}
/>

================================================================================
6. PROJECT DIRECTORY STRUCTURE
================================================================================

sewamics-admin/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx              # Top navigation bar
│   │   │   ├── Sidebar.tsx             # Left sidebar navigation
│   │   │   ├── Button.tsx              # Reusable button component
│   │   │   ├── Card.tsx                # Reusable card wrapper
│   │   │   ├── Input.tsx               # Form input (Zod validated)
│   │   │   ├── Modal.tsx               # Confirmation/action modals
│   │   │   ├── Loading.tsx             # Loading skeleton, spinner
│   │   │   ├── EmptyState.tsx          # Empty data placeholder
│   │   │   ├── Pagination.tsx          # Table pagination
│   │   │   ├── Badge.tsx               # Status/role badges
│   │   │   ├── Dropdown.tsx            # Dropdown menu
│   │   │   ├── Tabs.tsx                # Tab navigation
│   │   │   └── Breadcrumb.tsx          # Navigation breadcrumbs
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx           # Email input for OTP request
│   │   │   ├── OTPVerification.tsx     # 6-digit OTP input
│   │   │   └── UnauthorizedPage.tsx    # 403 error page
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx           # KPI card (sales, orders, etc.)
│   │   │   ├── SalesChart.tsx          # 30-day revenue line chart
│   │   │   ├── TopProductsChart.tsx    # Bar chart top 5 products
│   │   │   ├── OrderStatusChart.tsx    # Pie chart order breakdown
│   │   │   ├── RecentOrders.tsx        # Recent 5 orders table
│   │   │   ├── RecentActivity.tsx      # Activity log widget
│   │   │   └── Dashboard.tsx           # Main dashboard page
│   │   │
│   │   ├── products/
│   │   │   ├── ProductTable.tsx        # Product listing with filters
│   │   │   ├── ProductForm.tsx         # Add/edit product form
│   │   │   ├── ProductImageUpload.tsx  # Image upload component
│   │   │   ├── ProductDetailsModal.tsx # View product details
│   │   │   ├── ProductCard.tsx         # Individual product card
│   │   │   └── InventoryPage.tsx       # Products main page
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderTable.tsx          # Orders listing
│   │   │   ├── OrderDetails.tsx        # Full order view
│   │   │   ├── OrderStatusBadge.tsx    # Status display badge
│   │   │   ├── StatusUpdateModal.tsx   # Change order status
│   │   │   ├── OrderTimeline.tsx       # Status update timeline
│   │   │   └── OrdersPage.tsx          # Orders main page
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomerTable.tsx       # Customers listing
│   │   │   ├── CustomerProfile.tsx     # Customer detail view
│   │   │   ├── CustomerMetrics.tsx     # Stats (orders, spent, etc.)
│   │   │   └── CustomersPage.tsx       # Customers main page
│   │   │
│   │   ├── admins/
│   │   │   ├── AdminTable.tsx          # Admin staff listing
│   │   │   ├── AdminForm.tsx           # Create/edit admin form
│   │   │   ├── AdminRoleBadge.tsx      # Role display badge
│   │   │   └── AdminManagementPage.tsx # Admin main page
│   │   │
│   │   ├── settings/
│   │   │   ├── StoreConfigForm.tsx     # Edit store info
│   │   │   ├── PaymentMethodsInfo.tsx  # Display payment config
│   │   │   ├── ActivityLogsTable.tsx   # View audit trail
│   │   │   └── SettingsPage.tsx        # Settings main page
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportGenerator.tsx     # Period selector & export
│   │   │   ├── ReportCharts.tsx        # Charts container
│   │   │   ├── ReportTable.tsx         # Data table view
│   │   │   ├── ReportMetrics.tsx       # KPI summary
│   │   │   └── ReportsPage.tsx         # Reports main page
│   │   │
│   │   └── profile/
│   │       ├── ProfileCard.tsx         # Admin profile display
│   │       ├── PasswordChangeForm.tsx  # Change password
│   │       └── ProfilePage.tsx         # Profile settings page
│   │
│   ├── context/
│   │   ├── AuthContext.tsx             # Auth state (user, role, token)
│   │   ├── RoleContext.tsx             # RBAC context (permissions)
│   │   ├── useAuth.ts                  # Auth hook
│   │   ├── useRole.ts                  # Role/permission hook
│   │   └── useSession.ts               # Session timeout hook
│   │
│   ├── services/
│   │   ├── firebase.ts                 # Firebase initialization
│   │   ├── authService.ts              # Email + OTP authentication
│   │   ├── productService.ts           # Products CRUD
│   │   ├── orderService.ts             # Orders queries/updates
│   │   ├── customerService.ts          # Customers queries
│   │   ├── adminService.ts             # Admin management
│   │   ├── settingsService.ts          # Store settings
│   │   ├── reportService.ts            # Report generation & caching
│   │   ├── activityLogService.ts       # Activity logging
│   │   ├── emailJSService.ts           # EmailJS OTP sending
│   │   ├── storageService.ts           # Firebase Storage (images)
│   │   └── firestoreQueries.ts         # Complex Firestore queries
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                  # Auth hook
│   │   ├── useRole.ts                  # Role/permission check
│   │   ├── useSession.ts               # Session timeout
│   │   ├── useProducts.ts              # Products data hook
│   │   ├── useOrders.ts                # Orders data hook
│   │   ├── useCustomers.ts             # Customers data hook
│   │   ├── useAdmins.ts                # Admins data hook
│   │   ├── useReports.ts               # Reports generation hook
│   │   ├── useActivityLogs.ts          # Activity logs hook
│   │   └── useForm.ts                  # Form submission wrapper
│   │
│   ├── types/
│   │   ├── admin.ts                    # Admin interface
│   │   ├── product.ts                  # Product interface
│   │   ├── order.ts                    # Order interface
│   │   ├── customer.ts                 # Customer interface
│   │   ├── report.ts                   # Report interface
│   │   ├── auth.ts                     # Auth types
│   │   ├── api.ts                      # API response types
│   │   └── common.ts                   # Shared types
│   │
│   ├── utils/
│   │   ├── constants.ts                # App constants, messages
│   │   ├── validators.ts               # Zod schemas for validation
│   │   ├── formatters.ts               # Date, currency, text formatters
│   │   ├── errorHandler.ts             # Centralized error handling
│   │   ├── permissions.ts              # Permission checking utilities
│   │   ├── queryHelpers.ts             # Firestore query builders
│   │   └── logger.ts                   # Logging utility
│   │
│   ├── styles/
│   │   ├── globals.css                 # Global styles + Tailwind imports
│   │   ├── animations.css              # Custom animations
│   │   ├── colors.css                  # CSS variables for brand colors
│   │   └── typography.css              # Font face definitions
│   │
│   ├── App.tsx                         # Main app component
│   ├── AppRoutes.tsx                   # Route definitions
│   ├── main.tsx                        # React DOM render
│   └── index.css                       # Root styles
│
├── public/
│   ├── fonts/
│   │   ├── Zalando-Bold.ttf
│   │   ├── Zalando-SemiBold.ttf
│   │   ├── Zalando-Medium.ttf
│   │   ├── Zalando-Regular.ttf
│   │   └── Zalando-Light.ttf
│   ├── icons/
│   │   └── logo.svg                    # SewaMics logo
│   └── images/
│       └── empty-state.svg             # Placeholder images
│
├── .env.example                        # Environment variables template
├── .env.local                          # Local env (git-ignored)
├── .gitignore                          # Git ignore rules
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript configuration
├── tailwind.config.js                  # Tailwind CSS config
├── postcss.config.js                   # PostCSS config
├── eslint.config.js                    # ESLint configuration
├── prettier.config.js                  # Prettier configuration
├── package.json                        # Dependencies
├── package-lock.json                   # Lock file
└── README.md                           # Project documentation

================================================================================
7. CORE SERVICES ARCHITECTURE
================================================================================

SERVICE 1: authService.ts
├── Functions:
│   ├── sendOTP(email: string) → Promise<void>
│   │   ├── Validates email format
│   │   ├── Checks if admin email exists in /admins
│   │   ├── Generates 6-digit OTP
│   │   ├── Stores OTP in memory (10-min expiry)
│   │   ├── Sends OTP via EmailJS
│   │   └── Returns success/error
│   │
│   ├── verifyOTP(email: string, otp: string) → Promise<AuthResult>
│   │   ├── Checks OTP validity
│   │   ├── Verifies expiration
│   │   ├── Limits to 3 attempts (30-sec lockout after)
│   │   ├── Creates Firebase custom token (backend API call)
│   │   ├── Signs in user
│   │   ├── Fetches admin role from /admins/{uid}
│   │   └── Returns { user, role, token }
│   │
│   ├── logout() → Promise<void>
│   │   ├── Logs activity: { action: 'LOGOUT', module: 'auth' }
│   │   └── Signs out from Firebase
│   │
│   ├── getCurrentAdmin() → Promise<Admin | null>
│   │   └── Fetches current user's admin profile
│   │
│   └── verifySession() → Promise<boolean>
│       └── Checks if current session is valid
│
└── Error Handling:
    ├── InvalidEmailError
    ├── AdminNotFoundError
    ├── InvalidOTPError
    ├── OTPExpiredError
    └── OTPLockoutError

SERVICE 2: productService.ts
├── Functions:
│   ├── getProducts(filters?: Filters) → Promise<Product[]>
│   │   ├── Query: firestore collection('products')
│   │   ├── Filters: category, status, price range, search
│   │   ├── Pagination: limit 20, offset
│   │   └── Returns: array of products
│   │
│   ├── getProductById(productId: string) → Promise<Product>
│   │   └── Fetch single product with full details
│   │
│   ├── createProduct(data: ProductInput) → Promise<Product>
│   │   ├── Validates input (Zod schema)
│   │   ├── Uploads images to Firebase Storage
│   │   ├── Creates document in /products
│   │   ├── Logs activity: { action: 'CREATE', module: 'products' }
│   │   └── Returns created product
│   │
│   ├── updateProduct(id: string, data: Partial<Product>) → Promise<Product>
│   │   ├── Validates input
│   │   ├── Updates images (delete old, upload new)
│   │   ├── Updates Firestore document
│   │   ├── Logs activity with oldValues & newValues
│   │   └── Returns updated product
│   │
│   ├── deleteProduct(id: string) → Promise<void>
│   │   ├── Soft delete: set isActive to false (preferred)
│   │   ├── Delete images from Firebase Storage
│   │   ├── Logs activity: { action: 'DELETE', module: 'products' }
│   │   └── Optional: hard delete with confirmation
│   │
│   ├── bulkUpdateProducts(ids: string[], updates: object) → Promise<void>
│   │   └── Batch update multiple products (status, stock, etc.)
│   │
│   └── getProductAnalytics(productId: string) → Promise<Analytics>
│       └── Returns sales metrics (qty sold, revenue, rating)
│
└── Image Upload Flow:
    ├── uploadProductImages(files: File[]) → Promise<string[]>
    │   ├── Validate file types (jpg, png, webp)
    │   ├── Validate file sizes (max 5MB each)
    │   ├── Upload to Firebase Storage: /products/{productId}/{timestamp}.jpg
    │   ├── Return array of download URLs
    │   └── Use Promise.all() for concurrent uploads
    │
    ├── deleteProductImage(imageUrl: string) → Promise<void>
    │   └── Delete from Firebase Storage
    │
    └── Error Handling:
        ├── InvalidFileTypeError
        ├── FileTooLargeError
        ├── StorageQuotaExceededError
        └── ProductNotFoundError

SERVICE 3: orderService.ts
├── Functions:
│   ├── getOrders(filters?: Filters) → Promise<Order[]>
│   │   ├── Filters: status, payment status, date range, amount range
│   │   ├── Pagination: limit 20
│   │   └── Sort: createdAt descending
│   │
│   ├── getOrderById(orderId: string) → Promise<Order>
│   │   └── Fetch order with full details (items, address, payment)
│   │
│   ├── updateOrderStatus(orderId: string, newStatus: OrderStatus) → Promise<void>
│   │   ├── Validate status transition (pending → processing → shipped → delivered)
│   │   ├── Update shippedAt/deliveredAt timestamps
│   │   ├── Update document in /orders
│   │   ├── Logs activity with status change
│   │   └── Trigger notification (if configured)
│   │
│   ├── getOrdersByDateRange(startDate: Date, endDate: Date) → Promise<Order[]>
│   │   └── For report generation
│   │
│   └── getOrderAnalytics() → Promise<OrderMetrics>
│       └── Returns: total, revenue, avg value, by status
│
└── Error Handling:
    ├── OrderNotFoundError
    ├── InvalidStatusTransitionError
    └── UnauthorizedAccessError

SERVICE 4: customerService.ts
├── Functions:
│   ├── getCustomers(filters?: Filters) → Promise<Customer[]>
│   │   ├── Filters: spending range, order count, registration date
│   │   ├── Pagination: limit 20
│   │   └── Joins: /users with order count, total spent
│   │
│   ├── getCustomerById(userId: string) → Promise<Customer>
│   │   ├── Fetch user profile from /users
│   │   ├── Fetch customer's order history
│   │   └── Calculate metrics: total orders, total spent, repeat rate
│   │
│   ├── getCustomerOrders(userId: string) → Promise<Order[]>
│   │   └── Fetch all orders by customer
│   │
│   └── getCustomerMetrics(userId: string) → Promise<CustomerMetrics>
│       └── Returns: total orders, total spent, repeat rate, avg order value
│
└── Error Handling:
    ├── CustomerNotFoundError
    └── UnauthorizedAccessError

SERVICE 5: adminService.ts
├── Functions:
│   ├── getAdmins(filters?: Filters) → Promise<Admin[]>
│   │   ├── Filters: role, status
│   │   └── Returns: only accessible to Super Admin
│   │
│   ├── getAdminById(adminID: string) → Promise<Admin>
│   │   └── Accessible to own profile or Super Admin
│   │
│   ├── createAdmin(data: AdminInput) → Promise<Admin>
│   │   ├── Validates email (unique)
│   │   ├── Creates Firebase Auth user with email
│   │   ├── Creates document in /admins
│   │   ├── Logs activity: { action: 'CREATE', module: 'admins' }
│   │   └── Super Admin only
│   │
│   ├── updateAdmin(id: string, data: Partial<Admin>) → Promise<Admin>
│   │   ├── Own profile: can update name, preferences
│   │   ├── Super Admin: can update role, status
│   │   ├── Logs activity with changes
│   │   └── Super Admin only (for role/status changes)
│   │
│   ├── deleteAdmin(id: string) → Promise<void>
│   │   ├── Prevent deleting last super admin
│   │   ├── Soft delete: set status to 'inactive'
│   │   ├── Logs activity
│   │   └── Super Admin only
│   │
│   └── changePassword(adminID: string, oldPassword: string, newPassword: string) → Promise<void>
│       └── Update Firebase Auth password
│
└── Error Handling:
    ├── AdminNotFoundError
    ├── DuplicateEmailError
    ├── LastSuperAdminError
    └── UnauthorizedAccessError

SERVICE 6: settingsService.ts
├── Functions:
│   ├── getSettings() → Promise<Settings>
│   │   └── Fetch /settings/storeConfig document
│   │
│   ├── updateSettings(data: Partial<Settings>) → Promise<Settings>
│   │   ├── Validates input (Zod schema)
│   │   ├── Updates /settings/storeConfig
│   │   ├── Logs activity
│   │   └── Super Admin only
│   │
│   └── getPaymentMethods() → Promise<PaymentMethod[]>
│       └── Fetch payment config (read-only for display)
│
└── Error Handling:
    ├── SettingsNotFoundError
    └── UnauthorizedAccessError

SERVICE 7: reportService.ts
├── Functions:
│   ├── generateReport(type: ReportType, period: Period) → Promise<Report>
│   │   ├── Fetch orders by date range
│   │   ├── Calculate metrics
│   │   ├── Generate breakdown (daily/weekly/monthly)
│   │   ├── Cache result in /reportCache
│   │   ├── Logs activity: { action: 'CREATE', module: 'reports' }
│   │   └── Returns report data
│   │
│   ├── getCachedReport(type: ReportType, period: Period) → Promise<Report | null>
│   │   ├── Check /reportCache for existing report
│   │   ├── Return if not expired (7/30 days)
│   │   └── Return null if expired
│   │
│   ├── exportReportAsPDF(report: Report) → Promise<Blob>
│   │   ├── Generate PDF with header, charts, tables
│   │   └── Return file blob
│   │
│   ├── exportReportAsCSV(report: Report) → Promise<Blob>
│   │   ├── Format data as CSV rows
│   │   └── Return file blob
│   │
│   ├── getReportAnalytics() → Promise<ReportMetadata[]>
│   │   └── List all cached reports with metadata
│   │
│   └── refreshReport(reportId: string) → Promise<Report>
│       └── Force regenerate cached report
│
└── Caching Strategy:
    ├── Weekly reports: expire after 7 days
    ├── Monthly reports: expire after 30 days
    ├── Annual reports: never auto-expire
    └── Manual refresh available

SERVICE 8: activityLogService.ts
├── Functions:
│   ├── logActivity(activity: ActivityLog) → Promise<void>
│   │   ├── Create document in /activityLogs
│   │   ├── Include timestamp, admin ID, action, module
│   │   ├── Include oldValues & newValues for updates
│   │   └── Auto-called by other services
│   │
│   ├── getActivityLogs(filters?: Filters) → Promise<ActivityLog[]>
│   │   ├── Filters: admin, action, module, date range
│   │   ├── Pagination: limit 50
│   │   └── Super Admin only
│   │
│   └── getActivityByTarget(targetId: string) → Promise<ActivityLog[]>
│       └── Get all activity for specific product/order/admin
│
└── Error Handling:
    └── UnauthorizedAccessError

SERVICE 9: emailJSService.ts
├── Configuration:
│   ├── Service ID: (from env)
│   ├── Public Key: (from env)
│   └── Template ID: (admin OTP template)
│
├── Functions:
│   ├── sendOTPEmail(email: string, otp: string, name: string) → Promise<void>
│   │   ├── Initialize EmailJS
│   │   ├── Send email via admin template
│   │   ├── Template variables: to_email, otp_code, otp_expiry
│   │   └── Error handling & retry logic
│   │
│   └── sendNotificationEmail(email: string, type: string, data: object) → Promise<void>
│       └── For future: order status updates, alerts
│
└── Error Handling:
    ├── EmailJSInitError
    └── EmailSendFailureError

SERVICE 10: storageService.ts
├── Configuration:
│   ├── Bucket: Firebase Storage bucket
│   ├── Max file size: 5MB per file
│   └── Allowed types: jpg, png, webp
│
├── Functions:
│   ├── uploadFile(file: File, path: string) → Promise<string>
│   │   ├── Validate file type & size
│   │   ├── Upload to Firebase Storage
│   │   ├── Return download URL
│   │   └── Error handling
│   │
│   ├── deleteFile(url: string) → Promise<void>
│   │   └── Delete file from Firebase Storage
│   │
│   └── getFileUrl(path: string) → Promise<string>
│       └── Get download URL for existing file
│
└── Error Handling:
    ├── InvalidFileTypeError
    ├── FileTooLargeError
    └── StorageError

================================================================================
8. COMPONENT HIERARCHY & REUSABLE COMPONENTS
================================================================================

DESIGN SYSTEM TOKENS (Tailwind Config):
┌────────────────────────────────────────────────────┐
│ Colors (CSS Variables)                             │
├────────────────────────────────────────────────────┤
│ --color-berry-pink: #9d174d                        │
│ --color-orange: #ff914d                            │
│ --color-text-primary: #1f2937                      │
│ --color-text-secondary: #6b7280                    │
│ --color-border: #e5e7eb                            │
│ --color-icon-neutral: #9ca3af                      │
│ --color-bg-primary: #ffffff                        │
│ --color-bg-secondary: #f9fafb                      │
│ --color-bg-tertiary: #f3f4f6                       │
│ --color-success: #10b981                           │
│ --color-warning: #f59e0b                           │
│ --color-danger: #ef4444                            │
└────────────────────────────────────────────────────┘

REUSABLE COMPONENTS:

1. Button Component
   ├── Variants: primary, secondary, danger, outlined
   ├── Sizes: sm, md, lg
   ├── States: normal, loading, disabled
   ├── Example:
   │   <Button variant="primary" size="lg" loading={false}>
   │     Send OTP
   │   </Button>
   └── Styles:
       ├── Primary: bg-berry-pink, text-white, rounded-20px
       ├── Secondary: bg-orange, text-white
       ├── Danger: bg-red-500, text-white
       └── Outlined: border, text-primary, bg-transparent

2. Input Component
   ├── Types: text, email, number, password, tel
   ├── Validation: error state, error message
   ├── Icons: left/right icon support
   ├── Example:
   │   <Input 
   │     type="email"
   │     placeholder="admin@sewamics.com"
   │     error={errors.email}
   │   />
   └── Styles: border-gray, rounded-12px, focus:border-orange

3. Card Component
   ├── Padding: 16px default
   ├── Border radius: 16px
   ├── Shadow: soft (elevation 2)
   ├── Example:
   │   <Card title="Sales Overview">
   │     {children}
   │   </Card>
   └── Variants: default, highlighted, danger

4. Modal Component
   ├── Actions: confirm, cancel
   ├── Sizes: sm, md, lg
   ├── Example:
   │   <Modal isOpen={open} onClose={handleClose}>
   │     <h2>Delete Product?</h2>
   │     <Button onClick={handleDelete}>Delete</Button>
   │   </Modal>
   └── Styles: dark overlay, centered, rounded corners

5. Badge Component
   ├── Variants: success, warning, danger, info
   ├── Sizes: sm, md
   ├── Example:
   │   <Badge variant="success">Active</Badge>
   │   <Badge variant="danger">Cancelled</Badge>
   └── Styles: small rounded, colored background & text

6. Table Component
   ├── Features: sortable columns, filterable, paginated
   ├── Props: columns[], data[], onSort, onFilter
   ├── Example:
   │   <Table
   │     columns={[{key: 'name', label: 'Product'}, ...]}
   │     data={products}
   │   />
   └── Responsive: horizontal scroll on mobile

7. Tabs Component
   ├── Features: multiple tab panels
   ├── Example:
   │   <Tabs defaultTab="weekly">
   │     <Tab label="Weekly">{weeklyReport}</Tab>
   │     <Tab label="Monthly">{monthlyReport}</Tab>
   │   </Tabs>
   └── Styles: underline or button style

8. Pagination Component
   ├── Features: prev/next, page numbers
   ├── Props: current, total, onPageChange
   └── Responsive: hidden on mobile if < 3 pages

9. Loading Skeleton Component
   ├── Mimics layout of expected content
   ├── Animated shimmer effect
   └── Used while fetching data

10. Dropdown Component
    ├── Features: multiple items, icons
    ├── Example:
    │   <Dropdown
    │     items={[
    │       {label: 'Edit', onClick: handleEdit},
    │       {label: 'Delete', onClick: handleDelete, variant: 'danger'}
    │     ]}
    │   >
    │     <MoreIcon />
    │   </Dropdown>
    └── Styles: rounded, shadow, positioned absolutely

COMPONENT COMPOSITION EXAMPLE (ProductForm.tsx):
┌────────────────────────────────────────────────┐
│ ProductForm                                    │
├────────────────────────────────────────────────┤
│ ├── form (useForm hook)                        │
│ ├── Input (product name)                       │
│ ├── Select (category dropdown)                 │
│ ├── Input (price)                              │
│ ├── Input (stock)                              │
│ ├── Textarea (description)                     │
│ ├── ProductImageUpload                         │
│ │   ├── Input[type="file"] (hidden)            │
│ │   ├── Button (upload trigger)                │
│ │   ├── Loading (uploading state)              │
│ │   └── ImagePreview (thumbnails)              │
│ ├── Button (primary - "Save Product")          │
│ └── Button (secondary - "Cancel")              │
└────────────────────────────────────────────────┘

================================================================================
9. STATE MANAGEMENT STRATEGY (Context + React Query)
================================================================================

ARCHITECTURE:
┌──────────────────────────────────────────────────────┐
│ Global State (React Context + TanStack Query)        │
└──────────────────────────────────────────────────────┘
         │
         ├─ AuthContext (auth state, user, role)
         ├─ RoleContext (permissions, access checks)
         ├─ TanStack Query (data fetching, caching)
         └─ Component Local State (forms, UI toggles)

CONTEXT 1: AuthContext.tsx
├── State:
│   ├── user: Admin | null
│   ├── role: 'super_admin' | 'inventory_manager' | 'order_manager' | null
│   ├── email: string | null
│   ├── isAuthenticated: boolean
│   ├── isLoading: boolean
│   ├── error: string | null
│   └── sessionExpiresAt: Date | null
│
├── Actions:
│   ├── login(email: string, otp: string)
│   ├── logout()
│   ├── refreshToken()
│   └── updateUserProfile(data: Partial<Admin>)
│
└── Usage:
    const { user, role, isAuthenticated } = useAuth();

CONTEXT 2: RoleContext.tsx
├── State:
│   ├── currentRole: string
│   └── permissions: string[] (array of allowed actions)
│
├── Methods:
│   ├── canAccess(module: string): boolean
│   ├── hasPermission(action: string): boolean
│   └── getAccessibleModules(): string[]
│
└── Usage:
    const { canAccess, hasPermission } = useRole();
    {canAccess('products') && <InventoryPage />}

TANSTACK QUERY SETUP:
├── Query Client Configuration:
│   ├── staleTime: 5 minutes (default)
│   ├── cacheTime: 30 minutes
│   ├── retryDelay: exponential backoff
│   └── queryFn errors: logged to console in dev
│
├── Hooks (auto-generated by hooks):
│   ├── useProducts() - fetch, create, update, delete
│   ├── useOrders() - fetch, update status
│   ├── useCustomers() - fetch, get by id
│   ├── useAdmins() - fetch, create, update, delete
│   ├── useReports() - fetch, generate, export
│   └── useActivityLogs() - fetch logs
│
└── Usage:
    const { data, isLoading, error } = useProducts();
    const mutation = useUpdateProduct();

LOCAL COMPONENT STATE:
├── Form State:
│   ├── Use React Hook Form + Zod validation
│   ├── Manage form values locally
│   └── Example:
│       const form = useForm<ProductInput>({
│         resolver: zodResolver(productSchema)
│       });
│
├── UI State:
│   ├── Modal open/close: useState
│   ├── Tab selection: useState
│   ├── Dropdown visible: useState
│   └── Filter values: useState (for quick filters)
│
└── Temporary Data:
    ├── OTP input: useState (6 digits)
    ├── Password change form: useState
    └── Image upload preview: useState

QUERY INVALIDATION STRATEGY:
├── After product create/update/delete:
│   └── queryClient.invalidateQueries({ queryKey: ['products'] })
│
├── After order status update:
│   └── queryClient.invalidateQueries({ queryKey: ['orders'] })
│
├── After admin profile update:
│   └── queryClient.invalidateQueries({ queryKey: ['admins'] })
│
└── After settings change:
    └── queryClient.invalidateQueries({ queryKey: ['settings'] })

EXAMPLE: useProducts Hook
```typescript
export function useProducts(filters?: Filters) {
  const query = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductInput) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    ...query,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
```

================================================================================
10. ROUTING & PROTECTED ROUTES
================================================================================

ROUTE STRUCTURE:
/
├── /login (public)
│   ├── email input → /otp-verify
│   └── OTP input → /dashboard
│
├── /otp-verify (public, requires email in state)
│   └── 6-digit OTP input → /dashboard (on success)
│
├── /dashboard (protected, all roles)
│   └── Role-specific dashboard view
│
├── /inventory (protected, super_admin + inventory_manager)
│   ├── /inventory/products (list)
│   ├── /inventory/products/new (create)
│   ├── /inventory/products/:id (edit)
│   └── /inventory/products/:id/view (details)
│
├── /orders (protected, super_admin + order_manager)
│   ├── /orders (list)
│   └── /orders/:id (details + status update)
│
├── /customers (protected, super_admin + order_manager)
│   ├── /customers (list)
│   └── /customers/:id (profile)
│
├── /admins (protected, super_admin only)
│   ├── /admins (list)
│   ├── /admins/new (create)
│   └── /admins/:id (edit)
│
├── /settings (protected, super_admin only)
│   ├── /settings/store
│   ├── /settings/payment
│   └── /settings/activity-logs
│
├── /reports (protected, all admin roles)
│   ├── /reports/weekly
│   ├── /reports/monthly
│   └── /reports/annual
│
├── /profile (protected, all roles)
│   ├── /profile/view
│   └── /profile/change-password
│
├── /unauthorized (protected, all roles)
│   └── 403 error page
│
└── /404 (public)
    └── Page not found

PROTECTED ROUTE COMPONENT:
```typescript
interface ProtectedRouteProps {
  path: string;
  element: React.ReactElement;
  requiredRoles?: string[];
}

function ProtectedRoute({ 
  path, 
  element, 
  requiredRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(role!)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}
```

ROUTE DEFINITIONS (AppRoutes.tsx):
```typescript
export const routes = [
  { path: '/', element: <Navigate to="/dashboard" /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/otp-verify', element: <OTPVerificationPage /> },
  
  {
    path: '/dashboard',
    element: <ProtectedRoute element={<DashboardPage />} />,
  },
  
  {
    path: '/inventory/products',
    element: <ProtectedRoute 
      element={<InventoryPage />}
      requiredRoles={['super_admin', 'inventory_manager']}
    />,
  },
  
  {
    path: '/orders',
    element: <ProtectedRoute 
      element={<OrdersPage />}
      requiredRoles={['super_admin', 'order_manager']}
    />,
  },
  
  // ... more routes
  
  { path: '*', element: <NotFoundPage /> },
];
```

SESSION TIMEOUT IMPLEMENTATION:
```typescript
function useSessionTimeout(timeoutMinutes = 30) {
  const { logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        logout();
        alert('Session expired. Please log in again.');
      }, timeoutMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);

    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeoutMinutes, logout]);
}
```

================================================================================
11. UI/UX DESIGN SYSTEM (BRAND IDENTITY)
================================================================================

COLORS (CSS VARIABLES - Tailwind + custom CSS):
┌─────────────────────────────────────────────────┐
│ Brand Colors                                    │
├─────────────────────────────────────────────────┤
│ Berry Pink (Primary): #9d174d                   │
│   - Main headers, active CTAs, key highlights  │
│   - RGB: rgb(157, 23, 77)                       │
│   - Usage: Primary button bg, active tabs      │
│                                                 │
│ Tangerine Orange (Accent): #ff914d              │
│   - Highlights, pricing, ratings, timers       │
│   - RGB: rgb(255, 145, 77)                      │
│   - Usage: Secondary buttons, badges, icons    │
│                                                 │
│ Dark Charcoal (Text Primary): #1f2937           │
│   - Main headings, product titles, alerts      │
│   - RGB: rgb(31, 41, 55)                        │
│   - Usage: Primary text, headings (h1-h3)      │
│                                                 │
│ Cool Grey (Text Secondary): #6b7280            │
│   - Subtitles, helpers, placeholders           │
│   - RGB: rgb(107, 114, 128)                     │
│   - Usage: Secondary text, labels              │
│                                                 │
│ Light Border (Dividers): #e5e7eb                │
│   - Input borders, divider lines               │
│   - RGB: rgb(229, 231, 235)                     │
│   - Usage: Border color, separator lines       │
│                                                 │
│ Icon Neutral: #9ca3af                           │
│   - Unselected icons, auxiliary icons          │
│   - RGB: rgb(156, 163, 175)                     │
│   - Usage: Icon colors, disabled states        │
│                                                 │
│ Background White: #ffffff                       │
│   - Primary background, card surfaces          │
│   - RGB: rgb(255, 255, 255)                     │
│   - Usage: Main canvas, card bg                │
│                                                 │
│ Background Light: #f9fafb                       │
│   - Alternating rows, secondary surfaces       │
│   - RGB: rgb(249, 250, 251)                     │
│   - Usage: Alternate row colors, subtle bg     │
│                                                 │
│ Utility Colors                                  │
│ ├─ Success: #10b981 (green, confirmations)     │
│ ├─ Warning: #f59e0b (amber, cautions)          │
│ └─ Danger: #ef4444 (red, errors, destructive) │
└─────────────────────────────────────────────────┘

TYPOGRAPHY (Zalando Font Family):
┌─────────────────────────────────────────────────┐
│ Font Stack: Zalando-Bold, sans-serif            │
│ Fallback: -apple-system, BlinkMacSystemFont    │
├─────────────────────────────────────────────────┤
│ H1 (Page Title)                                 │
│ ├─ Font: Zalando-Bold                           │
│ ├─ Size: 32px                                   │
│ ├─ Weight: 700                                  │
│ ├─ Line Height: 1.2                             │
│ └─ Color: #1f2937                               │
│                                                 │
│ H2 (Section Header)                             │
│ ├─ Font: Zalando-Bold                           │
│ ├─ Size: 24px                                   │
│ ├─ Weight: 700                                  │
│ ├─ Line Height: 1.3                             │
│ └─ Color: #1f2937                               │
│                                                 │
│ H3 (Card Header)                                │
│ ├─ Font: Zalando-SemiBold                       │
│ ├─ Size: 18px                                   │
│ ├─ Weight: 600                                  │
│ ├─ Line Height: 1.4                             │
│ └─ Color: #1f2937                               │
│                                                 │
│ Body (Standard Text)                            │
│ ├─ Font: Zalando-Medium                         │
│ ├─ Size: 14px                                   │
│ ├─ Weight: 500                                  │
│ ├─ Line Height: 1.6                             │
│ └─ Color: #1f2937                               │
│                                                 │
│ Label (Form Labels)                             │
│ ├─ Font: Zalando-Regular                        │
│ ├─ Size: 13px                                   │
│ ├─ Weight: 400                                  │
│ └─ Color: #6b7280                               │
│                                                 │
│ Caption (Small Text)                            │
│ ├─ Font: Zalando-Light                          │
│ ├─ Size: 12px                                   │
│ ├─ Weight: 300                                  │
│ └─ Color: #9ca3af                               │
└─────────────────────────────────────────────────┘

SPACING & LAYOUT:
├─ Base Unit: 4px
├─ Screen Margin: 24px (desktop), 16px (mobile)
├─ Card Padding: 20px
├─ Card Gap: 16px
├─ Input Height: 44px
├─ Button Height: 48px
├─ Border Radius: 16px (cards), 20px (CTAs), 12px (inputs)
└─ Shadow: elevation 2 (light depth)

COMPONENT STYLING EXAMPLES:

Primary Button:
├─ Background: #9d174d (berry pink)
├─ Text Color: #ffffff (white)
├─ Padding: 12px 20px
├─ Border Radius: 20px
├─ Font Weight: 600
├─ Hover: brightness(0.95)
├─ Active: brightness(0.90)
└─ Disabled: opacity(0.5), cursor: not-allowed

Secondary Button:
├─ Background: #ff914d (orange)
├─ Text Color: #ffffff (white)
├─ Padding: 12px 20px
├─ Border Radius: 20px
├─ Font Weight: 600
├─ Hover: brightness(0.95)
└─ Active: brightness(0.90)

Input Field:
├─ Border: 1px solid #e5e7eb
├─ Border Radius: 12px
├─ Padding: 12px 16px
├─ Focus Border: 2px solid #ff914d
├─ Focus Shadow: 0 0 0 3px rgba(255, 145, 77, 0.1)
├─ Background: #ffffff
└─ Placeholder Color: #9ca3af

Card:
├─ Background: #ffffff
├─ Border Radius: 16px
├─ Padding: 20px
├─ Border: 1px solid #e5e7eb
├─ Shadow: 0 2px 8px rgba(0, 0, 0, 0.05)
└─ Hover: shadow increase (optional)

Badge:
├─ Success: bg-#10b981, text-white, rounded-8px, px-12px, py-4px
├─ Warning: bg-#f59e0b, text-white, rounded-8px
├─ Danger: bg-#ef4444, text-white, rounded-8px
└─ Info: bg-#3b82f6, text-white, rounded-8px

================================================================================
12. MODULE-BY-MODULE IMPLEMENTATION GUIDE
================================================================================

MODULE 1: AUTHENTICATION
┌─────────────────────────────────────────────────────┐
│ Components                                          │
├─────────────────────────────────────────────────────┤
│ ├─ LoginForm.tsx                                    │
│ │  └─ Email input + "Send OTP" button              │
│ │     ├─ Input validation (email format)            │
│ │     ├─ API call: authService.sendOTP(email)      │
│ │     ├─ Rate limiting: disable button for 60s     │
│ │     └─ Redirect to /otp-verify on success        │
│ │                                                  │
│ ├─ OTPVerification.tsx                              │
│ │  └─ 6-digit OTP input fields                     │
│ │     ├─ Auto-focus between fields                 │
│ │     ├─ Timer: 10-minute countdown                │
│ │     ├─ "Resend OTP" link (disabled initially)    │
│ │     ├─ API call: authService.verifyOTP(email, otp) │
│ │     ├─ Error handling: invalid/expired OTP       │
│ │     ├─ Lockout: 30s after 3 failed attempts      │
│ │     └─ Redirect to /dashboard on success         │
│ │                                                  │
│ └─ LoginLayout.tsx                                  │
│    └─ Wrapper: centered form, brand colors        │
│                                                   │
│ Context & Hooks                                   │
│ ├─ AuthContext.tsx (global auth state)            │
│ ├─ useAuth.ts (hook for components)               │
│ └─ useSessionTimeout.ts (30-min auto-logout)      │
│                                                   │
│ Services                                          │
│ ├─ authService.ts                                 │
│ │  ├─ sendOTP(email)                              │
│ │  ├─ verifyOTP(email, otp)                       │
│ │  └─ logout()                                    │
│ │                                                 │
│ └─ emailJSService.ts                              │
│    └─ sendOTPEmail(email, otp, name)              │
│                                                   │
│ Firestore Operations                              │
│ ├─ Query: /admins (check email exists)            │
│ ├─ Write: /activityLogs (log login/logout)        │
│ └─ Read: /admins/{uid} (fetch admin role)         │
│                                                   │
│ Error Scenarios                                   │
│ ├─ ❌ Email not found in /admins                   │
│ ├─ ❌ Invalid OTP format (not 6 digits)            │
│ ├─ ❌ Expired OTP (after 10 minutes)               │
│ ├─ ❌ Rate limit exceeded (5 requests per 10 min)  │
│ ├─ ❌ EmailJS service down                         │
│ └─ ✅ Success: redirect to /dashboard              │
└─────────────────────────────────────────────────────┘

MODULE 2: DASHBOARD
┌─────────────────────────────────────────────────────┐
│ Components                                          │
├─────────────────────────────────────────────────────┤
│ ├─ StatsCard.tsx                                    │
│ │  ├─ Displays KPI (sales, orders, revenue, etc.)  │
│ │  ├─ Number + percentage change                   │
│ │  ├─ Icon + brand color accent                    │
│ │  └─ Skeleton loader while fetching               │
│ │                                                  │
│ ├─ SalesChart.tsx                                   │
│ │  ├─ 30-day revenue line chart (Recharts)         │
│ │  ├─ Responsive, interactive tooltip              │
│ │  └─ Loads data from /reportCache or generated   │
│ │                                                  │
│ ├─ TopProductsChart.tsx                             │
│ │  ├─ Bar chart: top 5 products by sales           │
│ │  ├─ Shows product name + quantity sold           │
│ │  └─ Responsive, clickable to product detail      │
│ │                                                  │
│ ├─ OrderStatusChart.tsx                             │
│ │  ├─ Pie chart: breakdown by status               │
│ │  │  (pending, processing, shipped, delivered,   │
│ │  │   cancelled)                                  │
│ │  └─ Color coded by status                        │
│ │                                                  │
│ ├─ RecentOrders.tsx                                 │
│ │  ├─ Table: latest 5 orders                       │
│ │  ├─ Columns: Order ID, Customer, Total, Status  │
│ │  ├─ Clickable rows → /orders/:id                │
│ │  └─ Shows status badge                           │
│ │                                                  │
│ ├─ RecentActivity.tsx                               │
│ │  ├─ Timeline: latest 5 admin actions             │
│ │  ├─ Shows: action, module, admin, timestamp     │
│ │  └─ Only visible to Super Admin                  │
│ │                                                  │
│ └─ Dashboard.tsx (main page)                        │
│    ├─ Role-specific view                           │
│    │  ├─ Super Admin: all cards, all charts        │
│    │  ├─ Inventory Manager: product-focused       │
│    │  └─ Order Manager: order-focused              │
│    ├─ Grid layout (2-3 columns)                    │
│    ├─ Responsive: 1 column on mobile               │
│    └─ Refresh data button                          │
│                                                   │
│ Hooks & Services                                  │
│ ├─ useProducts() - fetch product data             │
│ ├─ useOrders() - fetch order data                 │
│ ├─ useReports() - fetch cached report data        │
│ ├─ useActivityLogs() - fetch activity logs        │
│ └─ useRole() - check access (Super Admin only)    │
│                                                   │
│ Firestore Operations                              │
│ ├─ Read: /orders (aggregate: count, sum)          │
│ ├─ Read: /products (count active)                 │
│ ├─ Read: /users (count)                           │
│ ├─ Read: /reportCache (fetch today's data)        │
│ └─ Read: /activityLogs (latest 5, Super Admin)    │
│                                                   │
│ Data Refresh Strategy                             │
│ ├─ On page load: fetch all data (React Query)    │
│ ├─ Stale time: 5 minutes (auto-refetch if stale)  │
│ ├─ Manual refresh: button triggers invalidateQuery │
│ └─ Real-time: optional WebSocket for live data   │
└─────────────────────────────────────────────────────┘

MODULE 3: INVENTORY MANAGEMENT (Products)
┌─────────────────────────────────────────────────────┐
│ Components                                          │
├─────────────────────────────────────────────────────┤
│ ├─ ProductTable.tsx                                 │
│ │  ├─ Columns: name, category, price, stock,      │
│ │  │           rating, status, actions             │
│ │  ├─ Features:                                    │
│ │  │  ├─ Search: by name, category, SKU           │
│ │  │  ├─ Filters: category, price range, status   │
│ │  │  ├─ Sort: by name, price, stock, rating      │
│ │  │  ├─ Pagination: 20 items per page            │
│ │  │  └─ Bulk actions: select multiple, delete/   │
│ │  │      activate/deactivate                      │
│ │  └─ Row actions: edit, delete, view details     │
│ │                                                  │
│ ├─ ProductForm.tsx                                  │
│ │  ├─ Add new product (POST)                       │
│ │  ├─ Edit existing (PUT)                          │
│ │  ├─ Fields:                                      │
│ │  │  ├─ Name (text input, required)               │
│ │  │  ├─ Category (dropdown, required)             │
│ │  │  ├─ Description (textarea, required)          │
│ │  │  ├─ Price (number input, required, min 0)    │
│ │  │  ├─ Stock (number input, required, min 0)    │
│ │  │  ├─ Low Stock Threshold (number, optional)   │
│ │  │  ├─ Images (file upload component)            │
│ │  │  └─ Status (active/inactive toggle)           │
│ │  ├─ Form validation: Zod schema                  │
│ │  ├─ API calls:                                   │
│ │  │  ├─ productService.createProduct(data)       │
│ │  │  └─ productService.updateProduct(id, data)   │
│ │  └─ Success: redirect to /inventory/products    │
│ │                                                  │
│ ├─ ProductImageUpload.tsx                           │
│ │  ├─ File input (multiple files allowed)          │
│ │  ├─ Validation:                                  │
│ │  │  ├─ File type: jpg, png, webp only           │
│ │  │  ├─ File size: max 5MB per file              │
│ │  │  └─ Total images: max 10 per product         │
│ │  ├─ Upload to Firebase Storage                   │
│ │  ├─ Display thumbnails with preview             │
│ │  ├─ Remove image button per thumbnail           │
│ │  ├─ Loading state: upload progress              │
│ │  └─ Error handling: type/size validation        │
│ │                                                  │
│ ├─ ProductDetailsModal.tsx                          │
│ │  ├─ View full product details                    │
│ │  ├─ Display: images, name, price, description   │
│ │  ├─ Analytics: qty sold, revenue, rating, reviews │
│ │  ├─ Actions: edit, delete                        │
│ │  └─ Modal close on backdrop click                │
│ │                                                  │
│ └─ InventoryPage.tsx (main)                         │
│    ├─ Header: "Inventory", "Add Product" button   │
│    ├─ Filters + search bar (sticky)                │
│    ├─ ProductTable component                       │
│    ├─ Pagination controls                          │
│    └─ Responsive: filters collapse on mobile      │
│                                                   │
│ Hooks & Services                                  │
│ ├─ useProducts(filters) - fetch products          │
│ ├─ useForm() - form state management              │
│ └─ productService - CRUD operations               │
│                                                   │
│ Firestore Operations                              │
│ ├─ Read: /products (with filters, paginated)      │
│ ├─ Create: /products/{productId} (new doc)        │
│ ├─ Update: /products/{productId} (partial)        │
│ ├─ Delete: /products/{productId} (soft delete)    │
│ ├─ Write: /activityLogs (log CRUD actions)        │
│ └─ Write: Firebase Storage (image files)          │
│                                                   │
│ Firebase Storage                                  │
│ ├─ Path: /products/{productId}/{timestamp}.jpg    │
│ ├─ Permissions: Inventory managers can upload     │
│ └─ Cleanup: delete old images on update           │
│                                                   │
│ Access Control                                    │
│ └─ Required: super_admin, inventory_manager       │
└─────────────────────────────────────────────────────┘

MODULE 4: ORDERS MANAGEMENT
┌─────────────────────────────────────────────────────┐
│ Components                                          │
├─────────────────────────────────────────────────────┤
│ ├─ OrderTable.tsx                                   │
│ │  ├─ Columns: Order ID, Customer, Total, Status, │
│ │  │           Date, Payment Status, Actions       │
│ │  ├─ Features:                                    │
│ │  │  ├─ Search: by Order ID, customer name       │
│ │  │  ├─ Filters: status, payment status, date    │
│ │  │  │           range, amount range              │
│ │  │  ├─ Sort: by date, total amount, status      │
│ │  │  ├─ Pagination: 20 items per page            │
│ │  │  └─ Status badge (colored)                    │
│ │  └─ Row click: open OrderDetails page           │
│ │                                                  │
│ ├─ OrderDetails.tsx                                 │
│ │  ├─ Layout: 2-column (details + timeline)       │
│ │  ├─ Left: order info                             │
│ │  │  ├─ Order header: ID, date, total            │
│ │  │  ├─ Items table: product, qty, price         │
│ │  │  ├─ Cost breakdown: subtotal, shipping, tax   │
│ │  │  ├─ Customer info: name, email, phone        │
│ │  │  ├─ Shipping address                          │
│ │  │  └─ Payment info: method, status              │
│ │  ├─ Right: status timeline                       │
│ │  │  ├─ pending → processing → shipped →          │
│ │  │    delivered (with timestamps)                │
│ │  │  └─ Cancelled option (if still pending)       │
│ │  ├─ Action button: "Update Status"              │
│ │  └─ Responsive: stack on mobile                  │
│ │                                                  │
│ ├─ StatusUpdateModal.tsx                            │
│ │  ├─ Current status display                       │
│ │  ├─ Dropdown: next available status              │
│ │  │  ├─ pending → [processing, cancelled]        │
│ │  │  ├─ processing → [shipped, cancelled]         │
│ │  │  ├─ shipped → [delivered]                     │
│ │  │  └─ delivered → [no change]                   │
│ │  ├─ Note field (optional)                        │
│ │  ├─ Confirm button + API call                    │
│ │  └─ Logs activity on success                     │
│ │                                                  │
│ ├─ OrderTimeline.tsx                                │
│ │  ├─ Vertical timeline of status changes          │
│ │  ├─ Shows: status, date, time, admin name      │
│ │  └─ Animated/visual indicators                   │
│ │                                                  │
│ └─ OrdersPage.tsx (main)                            │
│    ├─ Header: "Orders", filters                    │
│    ├─ OrderTable component                         │
│    ├─ Pagination controls                          │
│    └─ Responsive layout                            │
│                                                   │
│ Hooks & Services                                  │
│ ├─ useOrders(filters) - fetch orders              │
│ ├─ orderService.updateOrderStatus(id, status)     │
│ └─ useRole() - check access                       │
│                                                   │
│ Firestore Operations                              │
│ ├─ Read: /orders (filtered, paginated)            │
│ ├─ Update: /orders/{orderId} (status only)        │
│ ├─ Read: /users/{userId} (customer details)       │
│ ├─ Write: /activityLogs (log status changes)      │
│ └─ Update: /products/{productId} (decrement stock) │
│                                                   │
│ Access Control                                    │
│ └─ Required: super_admin, order_manager           │
└─────────────────────────────────────────────────────┘

[Modules 5-8 follow similar structure...]
[Detailed descriptions for: MODULE 5: CUSTOMER MANAGEMENT, MODULE 6: ADMIN MANAGEMENT, MODULE 7: SETTINGS, MODULE 8: REPORTS]
[Omitted for brevity - would follow same pattern]

================================================================================
13. FIRESTORE SECURITY RULES SUMMARY
================================================================================

AUTHENTICATION-BASED RULES:
✓ isAuthenticated() - checks request.auth != null
✓ isOwner(userId) - matches request.auth.uid
✓ isAdmin() - checks exists(/admins/{uid}) && status == 'active'
✓ getAdminRole() - retrieves role from /admins/{uid}
✓ isSuperAdmin() - role == 'super_admin'
✓ isInventoryManager() - role == 'inventory_manager'
✓ isOrderManager() - role == 'order_manager'

COLLECTION-LEVEL RULES:
│
├─ /admins/{adminID}
│  ├─ Read: Super Admin || Own admin (can read own profile)
│  ├─ Create: Super Admin only (with email, name, role, status)
│  ├─ Update: Super Admin (any field) || Own admin (name, preferences)
│  └─ Delete: Super Admin only (prevent self-deletion)
│
├─ /activityLogs/{logId}
│  ├─ Read: Super Admin only
│  ├─ Create: Any admin (with adminID, action, module, timestamp)
│  └─ Update/Delete: NEVER (immutable audit trail)
│
├─ /settings/{settingId}
│  ├─ Read: All authenticated users (public config)
│  ├─ Write: Super Admin only
│  └─ Singleton document: /settings/storeConfig
│
├─ /products/{productId}
│  ├─ Read: All authenticated + unauthenticated
│  ├─ Create/Delete: Inventory Manager || Super Admin
│  ├─ Update (full edit): Inventory Manager || Super Admin
│  └─ Update (stock only): Any authenticated user (during checkout)
│
├─ /orders/{orderId}
│  ├─ Read: Super Admin || Order Manager || Own user
│  ├─ Create: Authenticated user (userId must be own UID)
│  ├─ Update (full): Super Admin || Order Manager (status, payment)
│  ├─ Update (cancellation): Own user (status, paymentStatus, cancelledAt)
│  └─ Delete: NEVER (preserve audit trail)
│
├─ /users/{userId}
│  ├─ Read: Own user || Order Manager || Super Admin
│  ├─ Create/Update: Own user only
│  ├─ Delete: NEVER
│  └─ /users/{userId}/wishlist: Own user only (CRUD)
│
└─ /reportCache/{reportId}
   ├─ Read: Any authenticated admin
   ├─ Create/Update: Any authenticated admin
   └─ Delete: Super Admin only

IMPORTANT: All rules respect RBAC defined in /admins collection
           Activity logs are immutable (audit trail integrity)
           Self-deletion prevention for admins
           Product stock can only decrease or increase (validated)

================================================================================
14. PRODUCT IMAGE UPLOAD FLOW (FIREBASE STORAGE)
================================================================================

STEP 1: USER SELECTS IMAGES
┌──────────────────────────────────┐
│ ProductImageUpload component     │
│ ├─ Input[type="file"] (hidden)   │
│ ├─ Button: "Upload Images"       │
│ └─ Click → trigger file dialog   │
└──────────────────────────────────┘

STEP 2: VALIDATION (CLIENT-SIDE)
┌──────────────────────────────────┐
│ For each selected file:           │
│ ├─ Check extension:               │
│ │  ✓ jpg, jpeg, png, webp        │
│ │  ✗ other types → error         │
│ ├─ Check file size:               │
│ │  ✓ max 5MB per file            │
│ │  ✗ larger → error              │
│ ├─ Check total images:            │
│ │  ✓ max 10 images per product   │
│ │  ✗ more → truncate/error       │
│ └─ All pass? → proceed to upload  │
└──────────────────────────────────┘

STEP 3: UPLOAD TO FIREBASE STORAGE
┌──────────────────────────────────────────┐
│ For each validated file:                 │
│ ├─ Generate unique filename:             │
│ │  └─ /products/{productId}/{timestamp}  │
│ │     -{randomId}.{ext}                  │
│ ├─ Upload with Firestore Rules check:   │
│ │  ├─ User must be authenticated         │
│ │  ├─ Must have permission to edit      │
│ │  │  product (Inventory Manager)        │
│ │  └─ Rules enforce in Storage bucket    │
│ ├─ Show upload progress (%)              │
│ ├─ On success:                           │
│ │  └─ Get download URL from Firebase    │
│ ├─ On error:                             │
│ │  └─ Show user-friendly error msg       │
│ └─ Promise.all() for concurrent uploads │
└──────────────────────────────────────────┘

STEP 4: STORE URLS IN FIRESTORE
┌──────────────────────────────────────┐
│ After all uploads succeed:            │
│ ├─ Collect download URLs (array)      │
│ ├─ Add to ProductForm data            │
│ ├─ Submit form with image URLs        │
│ └─ productService.createProduct() or  │
│    productService.updateProduct()     │
│    └─ Writes /products/{id}           │
│       └─ images: [url1, url2, ...]    │
└──────────────────────────────────────┘

STEP 5: DISPLAY & MANAGE IMAGES
┌──────────────────────────────────┐
│ In ProductForm:                  │
│ ├─ Show thumbnails of uploaded   │
│ ├─ Display "X" button to remove  │
│ │  ├─ Client: remove from array  │
│ │  ├─ Server: delete from Storage │
│ │  └─ Update Firestore           │
│ ├─ Drag to reorder images        │
│ └─ Add more button to re-upload  │
└──────────────────────────────────┘

DELETION FLOW:
┌──────────────────────────────────┐
│ When product is deleted:          │
│ ├─ Iterate through image URLs    │
│ ├─ Call storageService.deleteFile│
│ │  └─ Delete from Storage bucket  │
│ ├─ Delete /products/{id} doc      │
│ ├─ Log activity                   │
│ └─ Confirm all deletions complete │
└──────────────────────────────────┘

SECURITY MEASURES:
✓ File type validation (client + server)
✓ File size limits (client + server)
✓ Firebase Storage Rules enforce user auth
✓ Only Inventory Managers can upload
✓ Unique filenames prevent collisions
✓ Download URLs are public (CDN cached)
✓ Files auto-cleaned on product deletion

================================================================================
15. ERROR HANDLING & LOADING STATES
================================================================================

ERROR HANDLING STRATEGY:
┌─────────────────────────────────────────────────┐
│ Types of Errors                                 │
├─────────────────────────────────────────────────┤
│ 1. Validation Errors                            │
│    ├─ Invalid email format                      │
│    ├─ Missing required fields                   │
│    ├─ File size too large                       │
│    └─ Display: inline field error (red text)    │
│                                                 │
│ 2. Authentication Errors                        │
│    ├─ Invalid OTP                               │
│    ├─ Expired session                           │
│    ├─ Unauthorized access                       │
│    └─ Display: toast + redirect to /login       │
│                                                 │
│ 3. Firestore Errors                             │
│    ├─ Document not found (404)                  │
│    ├─ Permission denied (403)                   │
│    ├─ Quota exceeded                            │
│    └─ Display: toast with error msg             │
│                                                 │
│ 4. Firebase Storage Errors                      │
│    ├─ File too large                            │
│    ├─ Invalid file type                         │
│    ├─ Quota exceeded                            │
│    └─ Display: toast with error msg             │
│                                                 │
│ 5. Network Errors                               │
│    ├─ No internet connection                    │
│    ├─ Request timeout                           │
│    ├─ Server error (5xx)                        │
│    └─ Display: retry button in toast            │
│                                                 │
│ 6. EmailJS Errors                               │
│    ├─ Email service unavailable                 │
│    ├─ Invalid template                          │
│    └─ Display: "Retry" button                   │
└─────────────────────────────────────────────────┘

ERROR HANDLING IMPLEMENTATION:
```typescript
// Central error handler utility
function handleError(error: unknown): ErrorInfo {
  if (error instanceof ValidationError) {
    return {
      type: 'validation',
      message: error.message,
      fields: error.fields,
    };
  }
  
  if (error instanceof FirestoreError) {
    if (error.code === 'permission-denied') {
      return {
        type: 'auth',
        message: 'You don\'t have permission to perform this action',
        action: 'redirect',
        target: '/unauthorized',
      };
    }
  }
  
  // Default error
  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    action: 'retry',
  };
}
```

LOADING STATES:
│
├─ Page Load:
│  ├─ Full page skeleton loader
│  ├─ Shows structure matching expected layout
│  └─ 2-3 second expected load time
│
├─ Component Fetch:
│  ├─ Card/row skeleton shimmer
│  ├─ Minimal blocking (show existing data)
│  └─ Background refresh
│
├─ Form Submission:
│  ├─ Disable button
│  ├─ Show spinner inside button
│  ├─ Disable form inputs
│  └─ Display saving state
│
├─ File Upload:
│  ├─ Show progress bar (%)
│  ├─ Cancel button available
│  ├─ "Uploading: 45% complete"
│  └─ Disable form until complete
│
└─ Mutation Operations:
   ├─ Optimistic updates (show change immediately)
   ├─ Rollback on error
   ├─ Toast notification on completion
   └─ Refetch data in background

TOAST NOTIFICATIONS:
├─ Success: green icon, 3-sec auto-dismiss
├─ Error: red icon, persistent until closed
├─ Warning: amber icon, 5-sec auto-dismiss
├─ Info: blue icon, 3-sec auto-dismiss
└─ Custom: "Action complete!", "15 items saved", etc.

================================================================================
16. PERFORMANCE OPTIMIZATION
================================================================================

STRATEGIES:

1. Code Splitting & Lazy Loading
   ├─ React.lazy() for module pages
   ├─ Suspense boundaries with loaders
   ├─ /inventory → lazy load InventoryPage
   ├─ /orders → lazy load OrdersPage
   └─ Reduce initial bundle ~40%

2. React Query Optimization
   ├─ Stale time: 5 minutes (default)
   ├─ Cache time: 30 minutes
   ├─ Paginated queries (20 items per page)
   ├─ Infinite scroll with useInfiniteQuery
   └─ Background refetching

3. Firestore Query Optimization
   ├─ Indexes: auto-created for common filters
   ├─ Pagination: limit(20) always
   ├─ Projection: fetch only needed fields
   ├─ Example:
   │  const products = db.collection('products')
   │    .where('isActive', '==', true)
   │    .where('category', '==', selectedCategory)
   │    .orderBy('createdAt', 'desc')
   │    .limit(20)
   │    .offset(pageNum * 20)
   └─ Avoid N+1 queries: batch operations

4. Image Optimization
   ├─ Firebase CDN caching (automatic)
   ├─ Lazy load images: IntersectionObserver
   ├─ Responsive images: srcset
   ├─ Thumbnail generation (future feature)
   └─ WebP format support

5. Rendering Optimization
   ├─ Memoization: React.memo for static components
   ├─ useMemo() for expensive calculations
   ├─ useCallback() to prevent prop changes
   ├─ Virtual lists for large tables
   └─ Debounce search input (300ms)

6. State Management Optimization
   ├─ Minimize re-renders with Context
   ├─ Split contexts by concern (Auth, Role, Data)
   ├─ Use custom hooks to avoid prop drilling
   └─ Avoid storing all data in Context

7. Bundle Size
   ├─ Minification: Vite automatic
   ├─ Tree shaking: unused code removed
   ├─ gzip compression: server configured
   ├─ Monitor with: npm run build --analyze
   └─ Target: < 500KB gzipped

PERFORMANCE MONITORING:
├─ Web Vitals: LCP, FID, CLS
├─ Custom metrics:
│  ├─ Time to first data fetch
│  ├─ Page load time by route
│  ├─ Firestore query time
│  └─ Image load time
├─ Tools: Lighthouse, DevTools, Firebase Analytics
└─ Goals:
   ├─ LCP: < 2.5 seconds
   ├─ FID: < 100ms
   ├─ CLS: < 0.1
   └─ Overall Lighthouse: > 85

================================================================================
17. DEVELOPMENT WORKFLOW & BEST PRACTICES
================================================================================

FOLDER STRUCTURE RULES:
✓ Group by feature (domain), not type
✓ /components/products contains only product UI
✓ /services/productService.ts (separate from UI)
✓ /types/product.ts (shared types)
✓ /utils/productValidators.ts (helper functions)

NAMING CONVENTIONS:
✓ Components: PascalCase (ProductForm.tsx)
✓ Hooks: camelCase with "use" prefix (useProducts.ts)
✓ Services: camelCase (productService.ts)
✓ Types: PascalCase (Product, Admin, Order)
✓ Constants: UPPER_SNAKE_CASE (MAX_FILE_SIZE)
✓ Functions: camelCase (getProductById)

TYPESCRIPT BEST PRACTICES:
✓ Always type function parameters & returns
✓ Use interfaces for objects, types for unions
✓ Avoid "any" type (use unknown, then assert)
✓ Export types alongside implementations
✓ Use generics for reusable functions
✓ Enable strict mode in tsconfig.json

CODE ORGANIZATION:
✓ Max 300 lines per component file
✓ Extract complex logic to custom hooks
✓ Keep components focused (single responsibility)
✓ Props interface above component definition
✓ Styled components or CSS modules for styles
✓ Constants in /utils/constants.ts

GIT WORKFLOW:
✓ Feature branches: feature/module-name
✓ Commit messages: [MODULE] Brief description
✓ Example: [AUTH] Add OTP verification form
✓ Pull requests: required before merge
✓ Code review: at least one approval

TESTING STRATEGY (Future):
├─ Unit: Jest + React Testing Library
├─ Integration: Firestore emulator tests
├─ E2E: Cypress or Playwright
├─ Coverage target: 80% minimum
└─ Run tests before commit: husky pre-commit hook

DEVELOPMENT SERVER:
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

================================================================================
18. DEPLOYMENT CHECKLIST
================================================================================

PRE-DEPLOYMENT:
☐ All tests passing (npm test)
☐ No TypeScript errors (npm run type-check)
☐ No ESLint warnings (npm run lint)
☐ Code formatted (npm run format)
☐ Build succeeds (npm run build)
☐ No console errors/warnings
☐ Responsive design tested on mobile/tablet
☐ Cross-browser testing (Chrome, Firefox, Safari, Edge)
☐ Accessibility audit: axe DevTools
☐ Performance audit: Lighthouse > 85
☐ Security review: no exposed API keys, env vars

ENVIRONMENT VARIABLES:
☐ .env.local configured with:
  ├─ Firebase credentials (apiKey, projectId, etc.)
  ├─ EmailJS credentials (serviceId, templateId, publicKey)
  ├─ API endpoints (if applicable)
  └─ Feature flags
☐ .env.example updated for team

FIRESTORE SETUP:
☐ Collections created: admins, activityLogs, settings, reportCache
☐ Security rules deployed
☐ Firestore indexes created for:
  ├─ /orders (status, createdAt)
  ├─ /products (category, status, createdAt)
  ├─ /activityLogs (timestamp)
  └─ /reportCache (period, generatedAt)
☐ Backup enabled (if production)

FIREBASE STORAGE:
☐ Storage bucket created
☐ CORS configured (if needed)
☐ Storage rules deployed
☐ Image size limits validated

EMAILJS:
☐ Service ID configured
☐ Admin OTP template created
☐ Public key in environment
☐ Test email sent successfully

DEPLOYMENT PLATFORMS:
 $ vercel deploy  (free tier, already deployed)                   
Git integration                  
 Automatic previews               
Edge functions support           
Serverless functions             


MONITORING & LOGGING:
├─ Firebase Console:
│  ├─ Firestore usage metrics
│  ├─ Authentication events
│  ├─ Storage usage
│  └─ Errors/exceptions
├─ Sentry (optional):
│  ├─ JavaScript error tracking
│  ├─ Source maps upload
│  └─ Alerts configuration
└─ Google Analytics (optional):
   ├─ User behavior tracking
   ├─ Page view analytics
   └─ Custom events

================================================================================
END OF ARCHITECTURE DOCUMENT
================================================================================

SUMMARY:
This comprehensive architecture covers:
✓ Complete authentication flow (Email + OTP via EmailJS)
✓ Role-based access control (3 tiers)
✓ 8 core admin modules (Auth, Dashboard, Inventory, Orders, Customers, Admins, Settings, Reports)
✓ Firestore schema & security rules
✓ React architecture (Context + React Query)
✓ Component design system (reusable, branded)
✓ Service layer (Firebase, EmailJS, Storage)
✓ Performance optimization strategies
