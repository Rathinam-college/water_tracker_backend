# 🚀 Rathinam Water Tracker API Documentation

This documentation provides a comprehensive list of all available API endpoints for the **Rathinam Water Tracker** system. These can be used in the **Postman** app for testing and integration.

## 📍 Base URL
`https://insight.rathinamtechzone.com/water_tracker/api/`

---

## 🔐 Authentication

The system uses **Basic Authentication**. You must include your username and password in the Request Headers.

### 1. Login
*   **URL:** `/login/`
*   **Method:** `POST`
*   **Body (JSON):**
    ```json
    {
        "username": "your_username",
        "password": "your_password"
    }
    ```
*   **Note:** This endpoint is used to verify credentials and fetch user profile data. For subsequent requests, use Basic Auth headers.

### 2. Password Reset Request
*   **URL:** `/auth/request-password-reset/`
*   **Method:** `POST`
*   **Body (JSON):** `{ "username": "your_username_or_email" }`

---

## 📊 Dashboard & Stats

### 1. Main Dashboard Stats
*   **URL:** `/dashboard-stats/`
*   **Method:** `GET`
*   **Description:** Returns total costs, volumes (KL), and water type breakdowns for the current month.

### 2. Multi-Month Comparison
*   **URL:** `/dashboard/multi-month-stats/?months=3`
*   **Method:** `GET`
*   **Description:** Returns comparative metrics for the specified number of months.

### 3. Dropdown Initialization Data
*   **URL:** `/dropdown-data/`
*   **Method:** `GET`
*   **Description:** Fetches all active Locations, Sources, and Vehicles for populating form dropdowns.

---

## 💧 Operations (Water Entry)

### 1. Water Purchase Entries
*   **URL:** `/entries/`
*   **Methods:** `GET` (List), `POST` (Create)
*   **Filters (Query Params):** `?vehicle=ID`, `?location=ID`, `?start_date=YYYY-MM-DD`, `?end_date=YYYY-MM-DD`, `?water_type=Type`

### 2. Yield Entries (Bore Well)
*   **URL:** `/yield-entries/`
*   **Methods:** `GET`, `POST`
*   **Bulk Entry:** `POST /yield-entries/bulk_create/` (Send an array of entries)

### 3. Consumption Entries
*   **URL:** `/consumption-entries/`
*   **Methods:** `GET`, `POST`
*   **Bulk Entry:** `POST /consumption-entries/bulk_create/`

---

## 📈 Reports
All report endpoints use **GET** and typically accept `start_date` and `end_date` as query parameters.

| Report Name | Endpoint | Key Parameters |
| :--- | :--- | :--- |
| **Monthly Summary** | `/reports/monthly-summary/` | `start_date`, `end_date` |
| **Daily Movement** | `/reports/daily-movement/` | `start_date`, `end_date` |
| **Daily Yield** | `/reports/daily-yield/` | `start_date`, `end_date` |
| **Normal Consumption** | `/reports/daily-normal-consumption/` | `start_date`, `end_date` |
| **Drinking Consumption**| `/reports/daily-drinking-consumption/`| `start_date`, `end_date` |
| **Vendor Usage** | `/reports/vendor-usage/` | `start_date`, `end_date` |
| **Yearly Trends** | `/reports/yearly-trend/` | `start_year`, `end_year` |
| **Cost Comparison** | `/reports/cost-comparison/` | `start_date`, `end_date` |

---

## ⚙️ Master Data Management (Viewsets)
The following resources follow standard REST patterns: `GET` (list), `POST` (add), `PUT` (edit), `DELETE` (remove).

*   **Users:** `/users/`
*   **Locations:** `/locations/`
*   **Water Sources:** `/sources/`
*   **Internal Vehicles:** `/internal-vehicles/`
*   **Vendor Vehicles:** `/vendor-vehicles/`
*   **Procurement Records:** `/procurement/`
*   **Monthly Budgets:** `/budget/`

---

## 🛡️ System Administration (Admin Only)

### 1. Database Backup
*   **URL:** `/system/backup/`
*   **Method:** `GET`
*   **Description:** Downloads a full JSON dump of the database.

### 2. Database Restore
*   **URL:** `/system/restore/`
*   **Method:** `POST`
*   **Payload:** Multipart Form-Data (file upload with key `"file"`)

### 3. Database Reset
*   **URL:** `/system/reset/`
*   **Method:** `POST`
*   **Warning:** Flushes all data and recreates the default admin.
