# 🚰 Water Tracker — Complete Codebase Guide

> A comprehensive developer guide for the **Water Tracker** application used by **Sri Krishna Institutions / Rathinam** to track water purchasing, yield monitoring, consumption analysis, procurement, and budgeting.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Backend Deep Dive](#4-backend-deep-dive)  
   4.1 [Database Models](#41-database-models-modelspy)  
   4.2 [Serializers](#42-serializers-serializerspy)  
   4.3 [API Endpoints](#43-api-endpoints-urlspy)  
   4.4 [Views & Business Logic](#44-views--business-logic)  
   4.5 [Reports Engine](#45-reports-engine-reports_viewspy)  
5. [Frontend Deep Dive](#5-frontend-deep-dive)  
   5.1 [Entry Point & Routing](#51-entry-point--routing-appjsx)  
   5.2 [Authentication](#52-authentication)  
   5.3 [API Service Layer](#53-api-service-layer-apijs)  
   5.4 [All Components](#54-all-41-components)  
   5.5 [Utility Modules](#55-utility-modules-exports)  
6. [Docker & Deployment](#6-docker--deployment)  
7. [Django Project Settings](#7-django-project-settings-rathinamhr)  
8. [How to Change Something](#8-how-to-change-something)  
9. [User Roles & Permissions](#9-user-roles--permissions)  
10. [Common Workflows](#10-common-workflows)

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      USER (Browser)                      │
└──────────────┬──────────────────────────────┬────────────┘
               │  Port 80                     │
               ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│    Nginx (Frontend)      │    │  /water_tracker/api/*    │
│  Serves React SPA        │───▶│  Reverse Proxy ──────────┤
│  /water_tracker/*        │    │                          │
└──────────────────────────┘    └──────────┬───────────────┘
                                           │ Port 8080
                                           ▼
                                ┌──────────────────────────┐
                                │   Django + Gunicorn      │
                                │   (Backend API)          │
                                └──────────┬───────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────┐
                                │   PostgreSQL Database    │
                                │   (External: 192.168.x)  │
                                └──────────────────────────┘
```

---

## 2. Technology Stack

| Layer        | Technology                                | Version  |
|--------------|-------------------------------------------|----------|
| **Frontend** | React                                     | 19.2     |
| **Build**    | Vite                                      | 7.3      |
| **Styling**  | Tailwind CSS                              | 3.4      |
| **Routing**  | React Router DOM                          | 7.13     |
| **Charts**   | Recharts                                  | 3.7      |
| **HTTP**     | Axios                                     | 1.13     |
| **Exports**  | jsPDF, html2canvas, PptxGenJS, SheetJS    | latest   |
| **Backend**  | Django + Django Rest Framework             | 6.0 / 3.x|
| **DB Config**| dj-database-url                           | latest   |
| **Auth**     | HTTP Basic Authentication                 | built-in |
| **Server**   | Gunicorn                                  | latest   |
| **Static**   | Whitenoise                                | latest   |
| **CORS**     | django-cors-headers                       | latest   |
| **Database** | PostgreSQL                                | 14+      |
| **Proxy**    | Nginx                                     | stable   |
| **Container**| Docker + Docker Compose                   | latest   |

---

## 3. Complete Folder Structure

```
water-tracker-prod/
│
├── manage.py                         # Django CLI entry point
├── requirements.txt                  # Python dependencies
├── .env                              # Environment variables (API URL, DB creds)
├── .dockerignore                     # Docker build exclusions
├── docker-compose.yml                # Orchestrates backend + frontend containers
├── Dockerfile.backend                # Multi-stage Python/Gunicorn image
├── Dockerfile.frontend               # Multi-stage Node/Nginx image
├── nginx.conf                        # Nginx reverse proxy + SPA config
├── create_gm_admin.py                # Script to create a GM admin user
│
├── rathinamHR/                       # Django Project Config
│   ├── __init__.py
│   ├── settings.py                   # Database, Apps, Auth, CORS, etc.
│   ├── urls.py                       # Root URL: /admin/ and /api/
│   ├── wsgi.py                       # WSGI application
│   └── asgi.py                       # ASGI application
│
└── apps/
    └── water_tracker/
        ├── __init__.py
        ├── User_Manual.md            # End-user manual
        │
        ├── backend/                  # ═══ DJANGO REST API ═══
        │   ├── apps.py              # App config (label: water_tracker)
        │   ├── models.py            # 15+ database models
        │   ├── serializers.py       # DRF serializers for all models
        │   ├── views.py             # CRUD ViewSets + custom views
        │   ├── reports_views.py     # Complex report aggregation views
        │   ├── urls.py              # API routing (router + custom paths)
        │   ├── pagination.py        # Custom pagination class
        │   ├── management/          # Django management commands
        │   │   └── commands/        # e.g., create_default_admin
        │   └── migrations/          # Auto-generated DB migrations
        │
        ├── frontend/                 # ═══ REACT SPA ═══
        │   ├── index.html           # HTML shell
        │   ├── package.json         # NPM dependencies & scripts
        │   ├── vite.config.js       # Vite build configuration
        │   ├── tailwind.config.js   # Tailwind CSS configuration
        │   ├── postcss.config.js    # PostCSS config
        │   ├── eslint.config.js     # Linter
        │   ├── public/              # Static public assets
        │   └── src/
        │       ├── main.jsx         # React DOM render entry
        │       ├── App.jsx          # Root component: Router + Navbar
        │       ├── App.css          # Global styles
        │       ├── index.css        # Tailwind imports
        │       ├── assets/          # Logo, images
        │       ├── context/
        │       │   └── AuthContext.jsx    # Auth state (login, logout, user)
        │       ├── services/
        │       │   └── api.js             # Axios instance + interceptors
        │       ├── utils/
        │       │   ├── excelExport.js     # Excel (XLSX) export helper
        │       │   ├── pdfExport.js       # PDF export helper
        │       │   └── pptxExport.js      # PowerPoint export helper
        │       └── components/            # ═══ 41 UI COMPONENTS ═══
        │           ├── Login.jsx
        │           ├── Dashboard.jsx
        │           ├── ... (see Section 5.4)
        │           └── YieldEntries.jsx
        │
        ├── data/                    # Data files / fixtures
        ├── docs/                    # Additional documentation
        └── scripts/                 # Maintenance scripts
```

---

## 4. Backend Deep Dive

### 4.1 Database Models (`models.py`)

There are **15 models** organized into logical groups:

#### Group A: Authentication & Authorization
| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Custom user extending `AbstractUser`. Has `role` (Admin, Data_Entry, Viewer) and 4 boolean permission flags: `can_access_operations`, `can_access_master_data`, `can_access_reports`, `can_manage_users`. |
| `PasswordResetRequest` | `password_reset_requests` | Admin-controlled password reset workflow. |

#### Group B: Master Data (Reference Tables)
| Model | Table | Purpose |
|-------|-------|---------|
| `MasterLocation` | `master_locations` | Physical sites for water loading/unloading (e.g., Hostel Block A). |
| `MasterSource` | `master_sources` | Water sources: Internal Bore, Well, Pipeline, or Vendor. |
| `MasterInternalVehicle` | `master_internal_vehicles` | Campus vehicles (name + capacity in liters). |
| `MasterVendorVehicle` | `master_vendor_vehicles` | Vendor vehicles (linked to a source). |

#### Group C: Rate / Cost Management
| Model | Table | Purpose |
|-------|-------|---------|
| `RateHistoryInternalVehicle` | `rate_history_internal_vehicles` | Cost per load for internal vehicles, with calculated cost/liter. |
| `RateHistoryVendor` | `rate_history_vendors` | Vendor rates per load or per liter, by water type (Drinking/Salt). |
| `RateHistoryPipeline` | `rate_history_pipeline` | Pipeline cost per liter. |
| `GeneralWaterRate` | `general_water_rates` | General normal/drinking water rates. |

#### Group D: Daily Transactions
| Model | Table | Purpose |
|-------|-------|---------|
| `WaterEntry` | `water_entries` | **Core model**. Records each water purchase: date, source, locations, shift, vehicle, quantity, cost, snapshots. |
| `YieldEntry` | `yield_entries` | Daily meter readings for borewells/wells. Calculates yield in liters. |
| `ConsumptionEntry` | `consumption_entries` | Daily meter readings at consumption points (buildings). |

#### Group E: Consumption Master & Categorization
| Model | Table | Purpose |
|-------|-------|---------|
| `ConsumptionCategory` | `consumption_categories` | Groups consumption locations (e.g., Hostels, Schools). |
| `CategoryStudentCount` | `category_student_counts` | Tracks student headcount per category over time. |
| `ConsumptionLocation` | `consumption_locations` | Individual consumption meters (Normal or Drinking type). |

#### Group F: Procurement & Budget
| Model | Table | Purpose |
|-------|-------|---------|
| `ProcurementEntry` | `procurement_entries` | Tracks PR numbers, PO numbers, OPEX, vendor bills, payment status. |
| `BudgetApproved` | `budget_approved` | Monthly approved budget amounts. |

---

### 4.2 Serializers (`serializers.py`)

Each model has a corresponding serializer (e.g., `UserSerializer`, `WaterEntrySerializer`). Key patterns:

- **Read-only computed fields**: Serializers add human-readable names from foreign keys, e.g., `source_name`, `loading_location_name`, `created_by_username`.
- **Write-only fields**: `UserSerializer.password` is write-only.
- **Full model exposure**: Most serializers use `fields = '__all__'`.

**To change what data the API returns**, edit the relevant serializer in this file.

---

### 4.3 API Endpoints (`urls.py`)

All API endpoints are prefixed with `/api/` (set in `rathinamHR/urls.py`).

#### Router-based CRUD Endpoints (auto-generated GET, POST, PUT, DELETE)

| URL Path | ViewSet | Purpose |
|----------|---------|---------|
| `/api/users/` | `UserViewSet` | User management |
| `/api/locations/` | `MasterLocationViewSet` | Manage locations |
| `/api/sources/` | `MasterSourceViewSet` | Manage water sources |
| `/api/internal-vehicles/` | `MasterInternalVehicleViewSet` | Manage campus vehicles |
| `/api/vendor-vehicles/` | `MasterVendorVehicleViewSet` | Manage vendor vehicles |
| `/api/rates/internal/` | `RateHistoryInternalVehicleViewSet` | Internal vehicle rates |
| `/api/rates/vendor/` | `RateHistoryVendorViewSet` | Vendor rates |
| `/api/rates/pipeline/` | `RateHistoryPipelineViewSet` | Pipeline rates |
| `/api/entries/` | `WaterEntryViewSet` | Water purchase entries |
| `/api/yield-locations/` | `YieldLocationViewSet` | Yield tracking locations |
| `/api/yield-entries/` | `YieldEntryViewSet` | Yield entries |
| `/api/consumption-categories/` | `ConsumptionCategoryViewSet` | Consumption categories |
| `/api/consumption-locations/` | `ConsumptionLocationViewSet` | Consumption meters |
| `/api/consumption-entries/` | `ConsumptionEntryViewSet` | Consumption entries |
| `/api/general-water-rates/` | `GeneralWaterRateViewSet` | General water rates |
| `/api/category-student-counts/` | `CategoryStudentCountViewSet` | Student counts |
| `/api/procurement/` | `ProcurementEntryViewSet` | Procurement entries |
| `/api/budget/` | `BudgetApprovedViewSet` | Budget amounts |
| `/api/password-reset-requests/` | `AdminPasswordResetViewSet` | Password resets |

#### Custom Endpoints

| URL Path | View | Purpose |
|----------|------|---------|
| `/api/login/` | `login_view` | Authenticate user, return user data |
| `/api/calculate-cost/` | `CalculateCostView` | Auto-calculate cost for an entry |
| `/api/last-pipeline-reading/` | `GetLastPipelineReadingView` | Get last pipeline meter reading |
| `/api/last-yield-reading/` | `GetLastYieldReadingView` | Get last yield reading for a location |
| `/api/last-consumption-reading/` | `GetLastConsumptionReadingView` | Get last consumption reading |
| `/api/dashboard-stats/` | `dashboard_stats` | Dashboard aggregate data |
| `/api/dashboard/multi-month-stats/` | `multi_month_stats` | Multi-month dashboard data |
| `/api/dropdown-data/` | `dropdown_data` | All dropdown options for forms |

#### Report Endpoints

| URL Path | View | Report Type |
|----------|------|-------------|
| `/api/reports/monthly-summary/` | `MonthlySummaryReportView` | Monthly aggregation |
| `/api/reports/daily-movement/` | `DailyMovementReportView` | Daily water purchase log |
| `/api/reports/daily-yield/` | `DailyYieldReportView` | Daily yield readings |
| `/api/reports/daily-normal-consumption/` | `DailyNormalConsumptionReportView` | Daily consumption readings |
| `/api/reports/yearly-trend/` | `YearlyTrendReportView` | Year-over-year trends |
| `/api/reports/water-type/` | `WaterTypeConsumptionReportView` | Drinking vs Normal water |
| `/api/reports/vendor-usage/` | `VendorUsageReportView` | Vendor breakdown |
| `/api/reports/vehicle-utilization/` | `VehicleUtilizationReportView` | Vehicle usage stats |
| `/api/reports/cost-comparison/` | `CostComparisonReportView` | Cost comparison across sources |
| `/api/reports/site-consumption/` | `SiteConsumptionReportView` | Per-site water purchase |
| `/api/reports/capacity-utilization/` | `CapacityUtilizationReportView` | Capacity usage analysis |
| `/api/reports/site-detail/<id>/` | `SiteDetailReportView` | Detailed single-site report |
| `/api/reports/vendor-detail/<id>/` | `VendorDetailReportView` | Detailed single-vendor report |
| `/api/reports/rate-details/` | `RateDetailsReportView` | Rate history details |
| `/api/reports/category-monthly-breakdown/` | `CategoryMonthlyBreakdownReportView` | Per-category breakdown |
| `/api/reports/procurement/` | `ProcurementReportView` | Procurement summary |
| `/api/reports/muthu-nagar-building-wise/` | `MuthuNagarBuildingWiseReportView` | Muthu Nagar buildings |
| `/api/reports/bannari-building-wise/` | `BannariBuildingWiseReportView` | Bannari buildings |

#### System Endpoints (Admin Only)

| URL Path | Purpose |
|----------|---------|
| `/api/system/backup/` | Download database backup |
| `/api/system/restore/` | Restore database from backup |
| `/api/system/reset/` | Reset database |

---

### 4.4 Views & Business Logic (`views.py`)

This file (~76KB) contains:
- **ModelViewSets** for every model (full CRUD).
- **`login_view`**: Authenticates username/password, returns user data + permissions.
- **`CalculateCostView`**: Looks up the applicable rate for a given source/vehicle/date and returns the calculated cost.
- **`GetLastPipelineReadingView`**, **`GetLastYieldReadingView`**, **`GetLastConsumptionReadingView`**: Fetch the most recent meter reading so the frontend can auto-populate the "previous reading" field.
- **`dashboard_stats`**: Aggregates data for the Dashboard (totals, costs, source breakdown).
- **`dropdown_data`**: Returns all active locations, sources, vehicles, etc., for form dropdowns.

---

### 4.5 Reports Engine (`reports_views.py`)

This file (~78KB) is the heaviest backend file. It contains class-based views that perform complex Django ORM queries with `annotate()`, `aggregate()`, and `values()` to generate report data. Each report view accepts query parameters like `month`, `year`, `start_date`, `end_date`.

---

## 5. Frontend Deep Dive

### 5.1 Entry Point & Routing (`App.jsx`)

- **Entry**: `main.jsx` → renders `RootApp` → wraps `App` in `<AuthProvider>`.
- **Router Base**: `/water_tracker` (set via `<Router basename="/water_tracker">`).
- **Navbar**: Dropdown menus for **Operations**, **Master Data**, **Reports**, and **Admin**.
- **Route Guards**:
  - `<PrivateRoute>`: Redirects to `/login` if not authenticated.
  - `<AccessRoute permission="...">`: Checks specific permission flags on the user object.
- **Dark Mode**: Toggleable via a button, persisted to `localStorage`.

### 5.2 Authentication (`AuthContext.jsx`)

- Uses React Context API.
- **Login**: POSTs to `/api/login/`, stores Base64-encoded credentials in `localStorage` under key `auth`, and user object under key `user`.
- **Logout**: Clears `localStorage` and resets state.
- **Auth Method**: HTTP Basic Authentication (Base64 of `username:password` sent in every request header).

### 5.3 API Service Layer (`api.js`)

- Creates an **Axios instance** with `baseURL` from `VITE_API_URL` env var.
- **Request Interceptor**: Attaches `Authorization: Basic <token>` header from `localStorage`.
- **Response Interceptor**: On `401` error, clears auth and redirects to login page.

### 5.4 All 41 Components

Below is every component, organized by function:

#### 🔐 Authentication
| Component | File | Purpose |
|-----------|------|---------|
| Login | `Login.jsx` | Login form with username/password fields |

#### 📊 Dashboard
| Component | File | Purpose |
|-----------|------|---------|
| Dashboard | `Dashboard.jsx` | Main landing page with KPI cards and charts (Recharts) |

#### 📝 Operations (Data Entry)
| Component | File | Purpose |
|-----------|------|---------|
| Entries | `Entries.jsx` | List/filter/delete water purchase entries |
| AddEntry | `AddEntry.jsx` | **Largest component** (~85KB). Dynamic form for creating/editing water, yield, and consumption entries. Handles cost calculation, meter readings, and all validation |
| YieldEntries | `YieldEntries.jsx` | List/filter/delete yield tracking entries |
| BulkYieldEntry | `BulkYieldEntry.jsx` | Enter multiple yield readings at once (all locations for a date) |
| ConsumptionEntries | `ConsumptionEntries.jsx` | List/filter/delete consumption entries |
| BulkConsumptionEntry | `BulkConsumptionEntry.jsx` | Enter multiple consumption readings at once |
| ProcurementTracker | `ProcurementTracker.jsx` | Full CRUD for procurement entries (PR, PO, OPEX details) |

#### ⚙️ Master Data Management
| Component | File | Purpose |
|-----------|------|---------|
| Locations | `Locations.jsx` | CRUD for master locations (loading/unloading/yield/consumption) |
| Sources | `Sources.jsx` | CRUD for water sources (bore, well, pipeline, vendor) |
| Vehicles | `Vehicles.jsx` | CRUD for internal vehicles |
| Rates | `Rates.jsx` | Tab container for rate management sub-components |
| InternalVehicleRates | `InternalVehicleRates.jsx` | Manage internal vehicle cost rates |
| VendorRates | `VendorRates.jsx` | Manage vendor cost rates |
| PipelineRates | `PipelineRates.jsx` | Manage pipeline cost rates |
| StudentCountTable | `StudentCountTable.jsx` | Manage student counts per consumption category |
| BudgetTracking | `BudgetTracking.jsx` | Set approved budget per month |

#### 📈 Reports
| Component | File | Purpose |
|-----------|------|---------|
| Reports | `Reports.jsx` | Tab-based report container, renders the correct report based on `?tab=` query param |
| DailyMovement | `DailyMovement.jsx` | Daily water purchase report with table |
| DailyYieldReport | `DailyYieldReport.jsx` | Daily yield readings report |
| DailyNormalConsumptionReport | `DailyNormalConsumptionReport.jsx` | Daily consumption readings report |
| MonthlySummary | `MonthlySummary.jsx` | Monthly aggregated water purchase report |
| YearlyTrend | `YearlyTrend.jsx` | Year-over-year comparison chart |
| WaterTypeConsumption | `WaterTypeConsumption.jsx` | Drinking vs Normal water breakdown |
| VendorUsage | `VendorUsage.jsx` | Vendor-wise water usage |
| VehicleUtilization | `VehicleUtilization.jsx` | Vehicle load and cost analysis |
| CostComparison | `CostComparison.jsx` | Source cost comparison |
| SiteConsumption | `SiteConsumption.jsx` | Per-site (location) water purchase summary |
| CapacityUtilization | `CapacityUtilization.jsx` | Capacity usage analysis |
| CategoryMonthlyBreakdown | `CategoryMonthlyBreakdown.jsx` | **Large** (~65KB). Per-category monthly data with per-capita calculations |
| SiteDetail | `SiteDetail.jsx` | Drill-down for a specific site |
| VendorDetail | `VendorDetail.jsx` | Drill-down for a specific vendor |
| RateDetails | `RateDetails.jsx` | Historical rate information |
| ProcurementReport | `ProcurementReport.jsx` | Procurement summary report |
| MuthuNagarBuildingWise | `MuthuNagarBuildingWise.jsx` | Building-wise report for Muthu Nagar campus |
| BannariBuildingWise | `BannariBuildingWise.jsx` | Building-wise report for Bannari campus |
| Slideshow | `Slideshow.jsx` | Auto-playing presentation of all report charts |

#### 🔧 Admin
| Component | File | Purpose |
|-----------|------|---------|
| UserManagement | `UserManagement.jsx` | Create/edit/delete users, manage permissions, handle password resets |

#### 🧩 Shared / Utility
| Component | File | Purpose |
|-----------|------|---------|
| Modal | `Modal.jsx` | Reusable modal dialog wrapper |
| Toast | `Toast.jsx` | Notification toast component |

### 5.5 Utility Modules (Exports)

| File | Purpose |
|------|---------|
| `utils/excelExport.js` | Exports table data to `.xlsx` files using **SheetJS** |
| `utils/pdfExport.js` | Exports content to PDF using **jsPDF** + **html2canvas** |
| `utils/pptxExport.js` | Exports charts/content to PowerPoint using **PptxGenJS** |

---

## 6. Docker & Deployment

### `Dockerfile.backend` (Multi-stage)
1. **Build stage**: `python:3.11-slim` — installs dependencies, builds wheels.
2. **Final stage**: Copies wheels, runs `collectstatic`, starts with:
   ```
   python manage.py migrate --noinput && python manage.py create_default_admin && gunicorn --bind 0.0.0.0:$PORT rathinamHR.wsgi:application
   ```

### `Dockerfile.frontend` (Multi-stage)
1. **Build stage**: `node:20-alpine` — `npm install` + `npm run build` (Vite produces `/dist`).
2. **Production stage**: `nginx:stable-alpine` — copies built files to `/usr/share/nginx/html/water_tracker/` and uses custom `nginx.conf`.

### `docker-compose.yml`
```yaml
services:
  backend:
    image: janartlivein/water-tracker-backend:latest
    expose: ["8080"]
    environment: DATABASE_URL, DJANGO_SECRET_KEY, DEBUG, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS
  frontend:
    image: janartlivein/water-tracker-frontend:latest
    ports: ["80:80"]
    depends_on: [backend]
    args: VITE_API_URL
```

### `nginx.conf`
- `/water_tracker/api/*` → reverse proxy to `http://backend:8080/api/`
- `/water_tracker/*` → serves React SPA with `try_files` fallback to `index.html`
- `/` → redirects to `/water_tracker/`
- Static assets cached for 1 year

---

## 7. Django Project Settings (`rathinamHR/`)

| Setting | Value / Source |
|---------|---------------|
| `SECRET_KEY` | From `DJANGO_SECRET_KEY` env var |
| `DEBUG` | From `DEBUG` env var (defaults `True`) |
| `ALLOWED_HOSTS` | From `ALLOWED_HOSTS` env var |
| `DATABASES` | PostgreSQL via `DATABASE_URL` env var using `dj_database_url` |
| `AUTH_USER_MODEL` | `water_tracker.User` (custom user) |
| `REST_FRAMEWORK` | Basic Auth, `IsAuthenticated` by default, page size 10 |
| `CORS` | From `CORS_ALLOWED_ORIGINS` env var, supports wildcard `*` |
| `STATIC_ROOT` | `staticfiles/` directory, served by Whitenoise |
| Root URL Config | `rathinamHR.urls` → `/admin/` + `/api/` |

---

## 8. How to Change Something

### 🟢 Add a New Database Field
1. **Edit** `apps/water_tracker/backend/models.py` → add the field to the relevant model class.
2. **Edit** `apps/water_tracker/backend/serializers.py` → add the field if it's not using `fields = '__all__'`.
3. **Run Migrations**:
   ```bash
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```
4. **Update frontend** → edit the relevant component in `frontend/src/components/` to display/edit the new field.

### 🟡 Add a New API Endpoint
1. **Create the view** in `views.py` or `reports_views.py`.
2. **Register the URL** in `apps/water_tracker/backend/urls.py`:
   - For CRUD: `router.register(r'my-endpoint', MyViewSet)`
   - For custom: `path('my-endpoint/', MyView.as_view(), name='my-endpoint')`
3. **Create a serializer** in `serializers.py` if returning model data.

### 🔵 Add a New Frontend Page
1. **Create component**: `frontend/src/components/MyNewPage.jsx`
2. **Import in** `App.jsx`: `import MyNewPage from './components/MyNewPage';`
3. **Add route** in `App.jsx`:
   ```jsx
   <Route path="/my-page" element={
     <AccessRoute permission="can_access_operations">
       <MyNewPage />
     </AccessRoute>
   } />
   ```
4. **Add nav link** in the appropriate dropdown menu in `App.jsx`.

### 🟠 Add a New Report
1. **Backend**: Create a new class-based view in `reports_views.py` extending `APIView`.
2. **URL**: Add `path('reports/my-report/', MyReportView.as_view(), name='my-report')` in `urls.py`.
3. **Frontend**: Create `MyReport.jsx` in `components/`.
4. **Register in Reports.jsx**: Add a new tab case.
5. **Add nav link** in the Reports dropdown in `App.jsx`.

### 🔴 Change Environment / Deployment Settings
- **Local dev**: Edit `.env` file in project root.
- **Production**: Update `docker-compose.yml` environment variables.
- **Rebuild**: `docker-compose build` → `docker-compose up -d`.

---

## 9. User Roles & Permissions

| Permission Flag | Admin | Data_Entry | Viewer | Controls Access To |
|-----------------|-------|------------|--------|--------------------|
| `can_access_operations` | ✅ | ✅ | ❌ | Entries, Yield, Consumption, Procurement |
| `can_access_master_data` | ✅ | ❌ | ❌ | Locations, Sources, Vehicles, Rates, Budgets |
| `can_access_reports` | ✅ | ✅ | ✅ | All Reports |
| `can_manage_users` | ✅ | ❌ | ❌ | User Management, Password Resets |

> These are granular boolean flags on the `User` model. An Admin can customize any user's permissions individually.

---

## 10. Common Workflows

### Deploy a Code Change to Production
```bash
# 1. Build new images
docker-compose build backend
docker-compose build frontend --build-arg VITE_API_URL=/water_tracker/api/

# 2. Tag and push to Docker Hub
docker tag water-tracker-prod-backend janartlivein/water-tracker-backend:latest
docker push janartlivein/water-tracker-backend:latest
docker tag water-tracker-prod-frontend janartlivein/water-tracker-frontend:latest
docker push janartlivein/water-tracker-frontend:latest

# 3. On the server: pull and restart
docker-compose pull
docker-compose up -d
```

### Run Database Commands
```bash
# Make migrations after model change
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Django shell
docker-compose exec backend python manage.py shell
```

### Local Development
```bash
# Backend
pip install -r requirements.txt
python manage.py runserver

# Frontend
cd apps/water_tracker/frontend
npm install
npm run dev
```

---

> **📌 Quick Reference**: If you're unsure which file to edit, use this rule of thumb:
> - **Database/Data structure** → `models.py`
> - **API logic** → `views.py` or `reports_views.py`
> - **API format** → `serializers.py`
> - **API URLs** → `urls.py`
> - **UI pages** → `components/*.jsx`
> - **Navigation** → `App.jsx`
> - **Auth** → `AuthContext.jsx` + `api.js`
> - **Deployment** → `docker-compose.yml` + Dockerfiles
