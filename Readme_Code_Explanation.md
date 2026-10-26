# 🎨 Money Lending Management System — Frontend Deep-Dive & Line-by-Line Code Explanation

Welcome to the comprehensive, zero-knowledge architectural and line-by-line explanation of the **Money Lending Management System Frontend**.

Whether you have never written a line of JavaScript, React, or CSS before, this document explains **every single concept, architectural pattern, hook, component, layout, utility, style rule, and configuration file** in plain, simple English with technical depth.

---

## 📑 Table of Contents

1. [Zero-Knowledge Primer: Web & React Fundamentals](#1-zero-knowledge-primer-web--react-fundamentals)
2. [End-to-End Workflow & Component Tree Architecture](#2-end-to-end-workflow--component-tree-architecture)
3. [Master React & Web Encyclopedia](#3-master-react--web-encyclopedia)
4. [Build, Packaging & Configuration Files](#4-build-packaging--configuration-files)
   - [package.json](#packagejson)
   - [vite.config.js](#viteconfigjs)
   - [tailwind.config.js & postcss.config.js](#tailwindconfigjs--postcssconfigjs)
   - [index.html](#indexhtml)
5. [Styles & Visual Design System](#5-styles--visual-design-system)
   - [src/index.css (Glassmorphism & Theme)](#srcindexcss)
   - [src/App.css](#srcappcss)
6. [Bootstrap & Client-Side Routing](#6-bootstrap--client-side-routing)
   - [src/main.jsx (Application Entrypoint)](#srcmainjsx)
   - [src/App.jsx (Router & Route Registry)](#srcappjsx)
7. [Network Layer & Document Generation Services](#7-network-layer--document-generation-services)
   - [src/services/api.js (Axios & Interceptors)](#srcservicesapijs)
   - [src/services/statementPdf.js (PDF Generator)](#srcservicesstatementpdfjs)
8. [Shared UI Components](#8-shared-ui-components)
   - [src/components/ProtectedRoute.jsx](#srccomponentsprotectedroutejsx)
   - [src/components/StatusBadge.jsx](#srccomponentsstatusbadgejsx)
   - [src/components/CustomDatePicker.jsx](#srccomponentscustomdatepickerjsx)
   - [src/components/PaymentModal.jsx](#srccomponentspaymentmodaljsx)
9. [Master Layout & Navigation](#9-master-layout--navigation)
   - [src/layouts/Layout.jsx](#srelaylayoutslayoutjsx)
10. [Application Pages (Views)](#10-application-pages-views)
    - [src/pages/LoginPage.jsx](#srcpagesloginpagejsx)
    - [src/pages/SignupPage.jsx](#srcpagessignuppagejsx)
    - [src/pages/Dashboard.jsx](#srcpagesdashboardjsx)
    - [src/pages/BorrowerListPage.jsx](#srcpagesborrowerlistpagejsx)
    - [src/pages/BorrowerDetailsPage.jsx](#srcpagesborrowerdetailspagejsx)
    - [src/pages/AddLoanPage.jsx](#srcpagesaddloanpagejsx)

---

## 1. Zero-Knowledge Primer: Web & React Fundamentals

If you are brand new to modern frontend engineering, let us first explain the core concepts.

### What is a Frontend?
The frontend is everything that runs inside the user's web browser (Google Chrome, Firefox, Safari). It is responsible for:
* Presenting buttons, cards, text, and data visually.
* Listening for user interactions (clicks, keyboard inputs, form submissions).
* Communicating with the Backend API over the internet to send and receive JSON data.
* Updating the screen instantly without making the browser reload the entire webpage.

### What is a Single Page Application (SPA)?
In traditional older websites, clicking a link meant asking the server for a brand new HTML page, resulting in a blank white screen flicker. In a modern **Single Page Application (SPA)**:
* The browser downloads a single HTML file (`index.html`) and JavaScript bundle once.
* When the user clicks between "Dashboard", "Borrowers", or "Give Loan", JavaScript swaps the components on the screen instantly without reloading the page.

### What is React 19?
**React** is an open-source JavaScript library developed by Meta (Facebook) for building user interfaces using reusable building blocks called **Components**.
* **JSX (JavaScript XML):** A syntax extension allowing you to write HTML-like tags directly inside JavaScript code (e.g., `return <div className="card"><h1>Hello</h1></div>;`).
* **Components:** Self-contained functions that return JSX. For example, `StatusBadge` is a component that renders a colored pill tag based on loan status.
* **State (`useState`):** The internal memory of a component. When state changes, React automatically re-renders the component to show the updated data on screen.
* **Props:** Parameters passed from a parent component down to a child component (like passing arguments to a function).

### What is Tailwind CSS?
Traditionally, styling web pages required writing separate `.css` files with hundreds of custom selectors. **Tailwind CSS** is a utility-first CSS framework that provides pre-built atomic utility classes (like `flex`, `text-center`, `bg-slate-900`, `rounded-2xl`, `p-4`) directly in the HTML/JSX.

### What is Vite?
**Vite** (French word for "fast", pronounced *veet*) is the next-generation build tool and local development server that compiles and bundles modern JavaScript/React code with sub-millisecond Hot Module Replacement (HMR).

---

## 2. End-to-End Workflow & Component Tree Architecture

```
                                  [ Browser Window ]
                                           │
                                    index.html (#root)
                                           │
                                       main.jsx
                                 (createRoot / StrictMode)
                                           │
                                        App.jsx
                                  (BrowserRouter Router)
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             Public Routes                                 Protected Routes
           ┌────────┴────────┐                     (<ProtectedRoute> via JWT)
           │                 │                                    │
       /login            /register                            Layout.jsx
   (LoginPage)         (SignupPage)                  (Sidebar, Mobile Bar, Outlet)
                                                                  │
                                 ┌──────────────────┬─────────────┴─────────────┬─────────────────┐
                                 │                  │                           │                 │
                             Path: "/"     Path: "borrowers"        Path: "borrowers/:id"    Path: "add-loan"
                            (Dashboard)   (BorrowerListPage)      (BorrowerDetailsPage)       (AddLoanPage)
                                 │                  │                           │                 │
                           PaymentModal       CustomSelect                StatementPdf       CustomDropdown
                            StatusBadge     CustomDatePicker               PaymentModal      CustomDatePicker
                                                                           StatusBadge
```

### Complete End-to-End User Interaction Lifecycle:
1. **Initial Visit:** A user navigates to `https://money-ledging-frontend.vercel.app/`.
2. **Authentication Gate:** `ProtectedRoute` checks `localStorage.getItem('token')`. Since no token exists, the user is redirected to `/login`.
3. **Login Request:** The user enters credentials (`admin`/`admin123`). `LoginPage` calls `api.post('/api/auth/login')`.
4. **Token Persistence:** The backend returns a JWT token. `LoginPage` stores `token`, `username`, and `role` into `localStorage` and routes the user to `/`.
5. **Dashboard Rendering:** `Dashboard.jsx` mounts. Its `useEffect` fires `Promise.all(...)` to fetch summary metrics, overdue payments, and due-soon installments simultaneously via Axios.
6. **Automatic Bearer Injection:** Axios request interceptor attaches `Authorization: Bearer <token>` to every HTTP request automatically.
7. **Action Execution:** Clicking **"Collect Pay"** opens `PaymentModal`. Submitting records the payment, refreshes the dashboard counters, and displays updated real-time balances.

---

## 3. Master React & Web Encyclopedia

| Concept / Hook | Where It Appears | Plain-English Explanation |
|---|---|---|
| `useState(initialValue)` | All Pages & Modals | Declares a state variable and an updater function. When updated, React automatically re-renders the component with the new data. |
| `useEffect(fn, [deps])` | All Pages | Performs side-effects (e.g., fetching data from the API, setting timers, listening to document clicks). Re-runs whenever values in the dependency array change. |
| `useRef()` | `CustomDatePicker`, `CustomSelect` | Creates a persistent mutable object reference that survives re-renders. Used here to reference real DOM nodes to detect clicks outside popover menus. |
| `useNavigate()` | `LoginPage`, `SignupPage`, `Layout` | React Router hook that returns a navigation function to programmatically route the user to different URLs (e.g., `navigate('/login')`). |
| `useLocation()` | `Layout` | Returns the current URL location object. Used to highlight active sidebar tabs (e.g., `location.pathname === '/'`). |
| `useParams()` | `BorrowerDetailsPage` | Extracts dynamic route parameters from the URL (e.g., extracting the borrower ID from `/borrowers/:id`). |
| `<Outlet />` | `Layout` | React Router component acting as a placeholder where child route pages are rendered inside the master layout. |
| `<Navigate replace />` | `ProtectedRoute`, `App.jsx` | Performs automatic client-side redirects without reloading the page. |
| `<Link to="..." />` | Navigation links | Renders an accessible HTML anchor tag that intercepts browser clicks to perform instant client-side routing. |
| `Promise.all([...])` | `Dashboard`, `BorrowerDetailsPage` | Executes multiple asynchronous HTTP requests concurrently in parallel and waits for all of them to resolve. |
| `localStorage` | `api.js`, `ProtectedRoute`, `LoginPage` | Web browser persistent key-value storage surviving browser restarts. Used to store the JWT session token. |
| `backdrop-filter: blur(...)` | `index.css` | CSS property that blurs the background content behind an element to achieve a modern frosted-glass ("glassmorphism") look. |

---

## 4. Build, Packaging & Configuration Files

### package.json
The project configuration file for Node.js and NPM.

* **Lines 1–5:** Defines project metadata (`name: "frontend"`, `type: "module"` to use ES6 import/export syntax).
* **Lines 6–11 (`scripts`):**
  * `"dev": "vite"`: Starts the high-speed local development server.
  * `"build": "vite build"`: Compiles JSX, purges unused CSS, and bundles optimized static assets into the `dist/` directory.
  * `"lint": "oxlint"`: Runs an ultra-fast Rust-based linter to detect code smells and bugs.
  * `"preview": "vite preview"`: Tests the production build locally before deploying.
* **Lines 12–21 (`dependencies`):**
  * `react` & `react-dom` (v19.2): The core React library and DOM renderer.
  * `react-router-dom` (v7.18): Client-side routing engine managing URLs and page transitions.
  * `axios` (v1.19): Promise-based HTTP client for API communication.
  * `jspdf` & `jspdf-autotable`: In-browser client-side PDF document creation engine.
  * `lucide-react`: Lightweight, customizable SVG icon set.
  * `@tailwindcss/postcss` & `tailwindcss` (v4.3): Utility CSS styling engine.
* **Lines 22–32 (`devDependencies`):**
  * `@vitejs/plugin-react`: Vite compiler plugin enabling Fast Refresh for React.
  * `postcss` & `autoprefixer`: CSS post-processing pipeline ensuring cross-browser vendor prefix compatibility.

---

### vite.config.js
Configures the Vite build tool.
* **Lines 1–2:** Imports `defineConfig` from Vite and the official React plugin.
* **Lines 5–7:** Exports the configuration with `plugins: [react()]`, enabling JSX parsing and instant Hot Module Replacement during development.

---

### tailwind.config.js & postcss.config.js
* **`tailwind.config.js`:**
  * `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`: Tells Tailwind to scan all HTML and JSX files for CSS class names so it only includes the styles you actually use.
  * `theme.extend.colors.ledger`: Defines a warm, curated palette (`ledger-50` to `ledger-950`) providing an authentic, financial ledger look.
* **`postcss.config.js`:**
  * Plugs `@tailwindcss/postcss` and `autoprefixer` into the build toolchain.

---

### index.html
The single HTML file served to the browser.
* **Line 7:** `<title>frontend</title>`.
* **Line 10 (`<div id="root"></div>`):** The root DOM container where the entire React virtual DOM is mounted.
* **Line 11 (`<script type="module" src="/src/main.jsx"></script>`):** Loads the JavaScript entry point.

---

## 5. Styles & Visual Design System

### src/index.css
The global stylesheet establishing the dark-mode glassmorphic visual identity.

* **Line 1 (`@import "tailwindcss";`):** Imports Tailwind v4 styling engine.
* **Line 3:** Imports Google Fonts (`Outfit` font family with weights 300 to 800) for a modern, sleek appearance.
* **Lines 5–7 (`@theme`):** Sets `Outfit` as the primary sans-serif font across the application.
* **Lines 9–17 (`body`):** Applies a deep radial gradient background (`#1e1b4b` $\rightarrow$ `#0f172a` $\rightarrow$ `#030712`) that remains fixed during scrolling, paired with crisp white text (`#f8fafc`).
* **Lines 19–26 (`.glass-panel`):**
  Semi-transparent dark slate backdrop (`rgba(15, 23, 42, 0.45)`), $24\text{px}$ blur filter, subtle white border, and deep box shadow creating depth.
* **Lines 28–42 (`.glass-card` & `:hover`):**
  Applied to cards. On hover, increases opacity, elevates the card by $2\text{px}$ (`transform: translateY(-2px)`), and deepens the drop-shadow.
* **Lines 44–69 (`.glass-input`):**
  Custom styled form inputs. On focus, glows with an amber border (`#f59e0b`) and subtle halo shadow (`box-shadow: 0 0 16px rgba(245, 158, 11, 0.3)`).
* **Lines 71–80 (`.btn-animate`):**
  Micro-interactions: scales up slightly on hover (`scale(1.03)`) and contracts on click (`scale(0.97)`).
* **Lines 82–95 (`.card-animate` & `@keyframes slideUp`):**
  Smooth entry animation that slides elements upward by $18\text{px}$ while fading them in from opacity $0$ to $1$.
* **Lines 97–111 (Custom Scrollbars):**
  Ultra-thin $6\text{px}$ scrollbars with rounded thumb tracks blending with the dark theme.

---

### src/App.css
Kept intentionally clean to prevent any legacy CSS rules from conflicting with Tailwind utility classes.

---

## 6. Bootstrap & Client-Side Routing

### src/main.jsx
The entrypoint that mounts React into the browser DOM.
* **Line 1–4:** Imports `StrictMode`, `createRoot`, global styles (`index.css`), and the root `App` component.
* **Lines 6–10:** Finds the `<div id="root">` element in `index.html` and creates a React root. Wraps `<App />` in `<StrictMode>` to highlight potential bugs and lifecycle issues during development.

---

### src/App.jsx
The central routing registry configuring all navigation paths.

* **Lines 1–10:** Imports React Router components (`BrowserRouter`, `Routes`, `Route`, `Navigate`) and page views.
* **Lines 14–38 (`<Router>` & `<Routes>`):**
  * **Public Routes (Lines 17–18):**
    * `/login` $\rightarrow$ renders `<LoginPage />`.
    * `/register` $\rightarrow$ renders `<SignupPage />`.
  * **Protected Routes (Lines 21–33):**
    * Path `/` is wrapped inside `<ProtectedRoute>`, ensuring only authenticated users can enter.
    * Uses `<Layout />` as the parent wrapper.
    * Nested child routes:
      * `index` (default `/`) $\rightarrow$ `<Dashboard />`
      * `borrowers` $\rightarrow$ `<BorrowerListPage />`
      * `borrowers/:id` $\rightarrow$ `<BorrowerDetailsPage />` (dynamic ID)
      * `add-loan` $\rightarrow$ `<AddLoanPage />`
  * **Wildcard Fallback (Line 36):**
    * `<Route path="*" element={<Navigate to="/" replace />} />`: Catches any invalid or unrecognized URL and safely redirects the user back to `/`.

---

## 7. Network Layer & Document Generation Services

### src/services/api.js
A centralized, pre-configured Axios instance managing all network calls.

* **Line 3 (`API_BASE_URL`):** Points to the production backend deployment (`https://money-ledging-backend.onrender.com`).
* **Lines 5–10 (`axios.create`):** Configures default `Content-Type: application/json`.
* **Lines 12–24 (Request Interceptor):**
  Intercepts every outgoing HTTP request before it leaves the browser:
  * Reads `localStorage.getItem('token')`.
  * If a token exists, injects `config.headers.Authorization = "Bearer " + token`.
  * Developers never have to manually attach the authorization header in individual component files.
* **Lines 26–41 (Response Interceptor):**
  Inspects all incoming responses from the server:
  * If the response status is `401 Unauthorized` (meaning the token expired or is invalid):
  * Clears `token`, `username`, and `role` from `localStorage`.
  * Redirects the browser window to `/login`.

---

### src/services/statementPdf.js
Generates client-side downloadable PDF statements for borrowers and loans using `jspdf` and `jspdf-autotable`.

* **Lines 5–39 (`drawHeaderFooter`):**
  Draws a sleek header bar in dark slate (`#0f172a`), writes the golden title `"LENDING NOTEBOOK"`, document category, a bottom divider line, timestamp note, and dynamic page numbers (`Page X of Y`).
* **Lines 41–44 (`formatINR`):** Formats numeric values to Indian Rupee strings (e.g., `Rs. 50000.00`).
* **Lines 46–160 (`generateBorrowerStatement`):**
  * Creates an A4 portrait PDF document.
  * Formats borrower profile box (Full Name, Phone Number, masked Aadhaar `xxxx-xxxx-1234`, wrapped address, and notes).
  * Summarizes total principal borrowed, total repaid, and remaining balance in styled colored boxes.
  * Builds autoTable grids listing all associated loans and installment repayment schedules with exact payment dates.
  * Calls `doc.save(...)` to trigger an instant download in the user's browser.

---

## 8. Shared UI Components

### src/components/ProtectedRoute.jsx
A higher-order route guard.
* **Lines 4–10:** Reads `const token = localStorage.getItem('token')`.
* If no token is present, returns `<Navigate to="/login" replace />`.
* If authenticated, renders the requested `children` components.

---

### src/components/StatusBadge.jsx
A standardized visual status indicator.
* **Lines 3–4:** Accepts `status` prop and normalizes it to uppercase.
* **Lines 6–39 (`config`):** Defines text and Tailwind styles for every status:
  * `PAID`: Soft green background with green border (`bg-green-50 text-green-700`).
  * `DUE_SOON`: Amber background with `animate-pulse` glow.
  * `OVERDUE`: Strong red badge with bold text.
  * `ACTIVE`: Clean emerald badge.
  * `PARTIALLY_PAID`: Orange badge.
  * `COMPLETED` / `CANCELLED`: Subtle gray badges.
* **Lines 43–47:** Renders a rounded pill badge with clean typography.

---

### src/components/CustomDatePicker.jsx
A self-contained custom date picker popover designed from scratch, avoiding heavy third-party calendar dependencies.

* **Lines 8–18:** Parses `YYYY-MM-DD` strings into JavaScript `Date` objects, tracking viewing month and year.
* **Lines 20–28 (Click-outside detection):**
  Attaches an event listener to `document` on `mousedown`. If the user clicks outside `containerRef.current`, it automatically closes the popover.
* **Lines 45–56 (Date math):**
  * `getDaysInMonth(month, year)`: Uses `new Date(year, month + 1, 0).getDate()` to calculate the exact number of days in any month (handling 28, 29, 30, or 31 days including leap years).
  * `getFirstDayOfMonth(month, year)`: Finds what weekday the 1st of the month starts on ($0 = \text{Sunday}$ to $6 = \text{Saturday}$).
* **Lines 58–74 (Navigation):** `prevMonth()` and `nextMonth()` functions increment or decrement month and year.
* **Lines 99–138 (`renderDays`):**
  * Inserts empty spacer slots matching the start weekday offset.
  * Renders interactive buttons for each day:
    * Selected day: Highlighted with an amber-to-orange gradient and shadow.
    * Current day (today): Outlined with an amber border.
* **Lines 140–194:** Renders the trigger button displaying the formatted date (e.g., `"10 August 2026"`), and when open, renders the animated calendar dropdown grid.

---

### src/components/PaymentModal.jsx
The modal dialog used to record installment collections.

* **Lines 6–12:** Component state: `paidAmount`, `paidDate`, `notes`, `error`, `isLoading`.
* **Lines 14–22 (`useEffect`):** When opened, calculates the remaining balance on the installment (`expectedAmount - paidAmount`), pre-populates `paidAmount` with this value, sets the date to today, and clears old errors.
* **Lines 28–69 (`handleSubmit`):**
  * Validates that `amountNum > 0` and does not exceed the outstanding installment balance.
  * Determines payment type:
    * If `amountNum < remainingExpected`: Calls `/api/payments/${payment.id}/partial-payment`.
    * If `amountNum === remainingExpected`: Calls `/api/payments/${payment.id}/pay`.
  * On success, invokes `onSuccess()` to refresh parent data and calls `onClose()`.
* **Lines 71–187:** Renders backdrop blur, borrower details, amount input, date picker, notes textarea, and confirmation button.

---

## 9. Master Layout & Navigation

### src/layouts/Layout.jsx
The master shell wrapping all authenticated pages.

* **Lines 6–9:** Manages mobile drawer toggle (`isMobileMenuOpen`), tracks current route via `useLocation()`, and retrieves the logged-in username from `localStorage`.
* **Lines 11–15 (`navItems`):** Defines navigation links:
  * Dashboard (`/`, `LayoutDashboard` icon).
  * Borrowers (`/borrowers`, `Users` icon).
  * Give New Loan (`/add-loan`, `PlusCircle` icon).
* **Lines 17–22 (`handleLogout`):** Clears authentication tokens from `localStorage` and redirects to `/login`.
* **Lines 31–76 (Desktop Sidebar):**
  Fixed $64\text{px}$ sidebar with gold notebook branding, navigation links highlighting active states with amber gradients, user profile badge, and logout button.
* **Lines 79–127 (Mobile Header & Drawer):**
  Top navbar displaying a hamburger menu button. Clicking toggles a full-width mobile menu drawer.
* **Lines 130–133 (`<main>`):**
  Centered content area containing `<Outlet />`, which dynamically renders the active page view.

---

## 10. Application Pages (Views)

### src/pages/LoginPage.jsx
The authentication gateway for administrators and lenders.

* **Lines 7–11:** State variables for `username`, `password`, `error`, and `isLoading`.
* **Lines 13–36 (`handleLogin`):**
  * Submits `POST /api/auth/login`.
  * Extracts `token`, `role`, and `username` from response.
  * Stores all three into `localStorage`.
  * Navigates to `/`.
* **Lines 38–132:** Renders a centered glassmorphic card with glowing ambient backdrop light, username and password inputs with Lucide icons, a sign-in button, and a link to create a new account.

---

### src/pages/SignupPage.jsx
Account registration view.

* **Lines 7–14:** States for credentials, `confirmPassword`, feedback alerts, and navigation.
* **Lines 15–48 (`handleSignup`):**
  * Client-side validation: verifies `password === confirmPassword` and `password.length >= 6`.
  * Submits `POST /api/auth/register`.
  * Shows a success notification and automatically redirects to `/login` after a 2-second timeout.

---

### src/pages/Dashboard.jsx
The analytical control center of the application.

* **Lines 9–19:** State holds `summary` metrics, `overdue` payments, `dueSoon` payments, `recent` payments, and modal toggles.
* **Lines 20–41 (`fetchDashboardData`):**
  Uses `Promise.all` to query 4 endpoints in parallel:
  1. `GET /api/dashboard/summary`
  2. `GET /api/dashboard/overdue`
  3. `GET /api/dashboard/due-soon`
  4. `GET /api/dashboard/recent-payments`
* **Lines 95–134 (Summary Cards):**
  * **Total Money Lent:** Sum of all principal given out.
  * **Total Money Collected:** Principal + interest collected to date.
  * **Outstanding Receivable:** Remaining money to be collected.
* **Lines 137–231 (Urgent Action Lists):**
  * **Overdue Payments:** Highlights late installments with a count badge and days overdue (`payment.lateDays`).
  * **Due within 3 Days:** Displays installments due today or within 72 hours with countdown tags (`"Due today"`, `"Due in 2 days"`).
  * Both lists feature a **Collect Pay** button that opens `PaymentModal` directly.
* **Lines 234–276 (Recent Payments Table):**
  Tabular log of the latest successful payments with clickable borrower links, paid amounts, dates, and notes.

---

### src/pages/BorrowerListPage.jsx
Full customer directory with real-time search and profile management.

* **Lines 7–60 (`CustomSelect`):** Custom dropdown component for filtering.
* **Lines 63–84:** States for borrowers list, search query, date filters, and modal controls (Add, Edit, Delete).
* **Lines 85–101 (`fetchBorrowers`):** Fetches borrowers with optional search query string (`?query=`). Re-runs automatically as the user types in the search bar.
* **Lines 129–159 (`handleAddBorrower`):** Validates and submits a new borrower via `POST /api/borrowers`.
* **Borrower Grid Cards:**
  Each borrower card displays:
  * Full name, phone number, and address.
  * Count of active loans.
  * Total outstanding amount owed.
  * Next payment date badge.
  * Quick action buttons: View details, Edit profile, and Delete borrower.

---

### src/pages/BorrowerDetailsPage.jsx
Deep-dive view into a specific borrower's financial history.

* **Line 10:** Extracts borrower ID via `const { id } = useParams()`.
* **Lines 21–55 (`fetchBorrowerDetails`):**
  1. Fetches borrower profile (`GET /api/borrowers/${id}`).
  2. Fetches all loans issued to this borrower (`GET /api/loans/borrower/${id}`).
  3. Iterates over loans to fetch all individual installment schedules (`GET /api/payments/loan/${loan.id}`).
* **Lines 94–99:** Computes cumulative stats: total borrowed, total repaid, and remaining balance.
* **Actions:**
  * **Download Statement:** Calls `generateBorrowerStatement(...)` from `statementPdf.js` to create an official account statement PDF.
  * **Give New Loan:** Routes to the loan creation wizard.
* **Loan History & Schedules:**
  Displays each loan with its interest rate, duration, and monthly installment, paired with a complete table of every payment installment (status badges, paid amounts, and "Collect" buttons).

---

### src/pages/AddLoanPage.jsx
The loan issuance wizard with real-time financial simulation.

* **Lines 7–55 (`CustomDropdown`):** Custom animated dropdown for borrower selection.
* **Lines 58–68:** Form inputs for borrower, principal amount, interest type, interest rate, duration, start date, and notes.
* **Lines 94–147 (Live Preview Calculator):**
  An active `useEffect` watches all loan input fields. On every keystroke:
  * Formulates a payload with the current numbers.
  * Calls `POST /api/loans/preview`.
  * Displays a live simulation card showing **Total Interest**, **Total Payable Amount**, and **Monthly Installment** before the user submits!
* **Lines 149–185 (`handleSubmit`):**
  Sends `POST /api/loans` to create the loan contract, generate the payment installment schedule, and redirect back to the borrower's details page.

---

## Summary Checklist

| Module | Core Responsibility | Key Files |
|---|---|---|
| **Build & Tooling** | Bundling, dependencies, and linting | `package.json`, `vite.config.js` |
| **Design System** | Glassmorphism, animations, colors | `src/index.css`, `tailwind.config.js` |
| **Routing & Auth** | Navigation and route protection | `src/App.jsx`, `src/components/ProtectedRoute.jsx` |
| **Network & API** | HTTP client, interceptors, PDF generation | `src/services/api.js`, `src/services/statementPdf.js` |
| **Components** | Reusable UI widgets and dialogs | `PaymentModal.jsx`, `CustomDatePicker.jsx`, `StatusBadge.jsx` |
| **Layout** | Responsive desktop/mobile shell | `src/layouts/Layout.jsx` |
| **Pages** | Feature views and user workflows | `Dashboard.jsx`, `BorrowerListPage.jsx`, `AddLoanPage.jsx`, etc. |
