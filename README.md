<img width="1735" height="608" alt="simple api ui" src="https://github.com/user-attachments/assets/349db318-96ec-4150-9d61-df6af6bcaa09" />

# Catch Design Backend Dev Test
A coding test for Backend dev.

## Project Structure

```
catch-design-be-dev-test/
├── README.md                         # Main project documentation
├── customers.db                      # SQLite database (generated)
│
├── app/                              # Next.js web application
│   ├── package.json                  # Node.js dependencies
│   ├── next.config.ts                # Next.js configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── jest.config.js                # Jest testing configuration
│   ├── jest.setup.js                 # Jest setup file
│   ├── eslint.config.mjs             # ESLint configuration
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── components.json               # ShadCN UI components config
│   ├── README.md                     # App-specific documentation
│   ├── API_DOCUMENTATION.md          # API endpoints documentation
│   │
│   ├── app/                          # Next.js app directory
│   │   ├── layout.tsx                # Root layout component
│   │   ├── page.tsx                  # Home page with customer datatable
│   │   ├── globals.css               # Global styles
│   │   └── api/                      # API routes
│   │       └── customers/            # Customer API endpoints
│   │           ├── route.ts          # GET /api/customers endpoint
│   │           └── route.test.ts     # API endpoint tests (31 tests)
│   │
│   ├── components/                   # React components
│   │   ├── customers-data-table.tsx  # Customer datatable component
│   │   └── ui/                       # ShadCN UI components
│   │       ├── button.tsx            # Button component
│   │       ├── input.tsx             # Input component
│   │       ├── select.tsx            # Select component
│   │       └── table.tsx             # Table component
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── db.ts                     # SQLite database connection
│   │   ├── utils.ts                  # Helper utilities
│   │   ├── validation.ts             # Input validation functions
│   │   └── validation.test.ts        # Validation tests
│   │
│   ├── types/                        # TypeScript type definitions
│   │   └── customer.ts               # Customer interface
│   │
│   └── public/                       # Static assets
│
├── data-importer/                    # Python CSV importer module
│   ├── __init__.py                   # Package initialization
│   ├── csv_importer.py               # Main CSV importer class
│   ├── test_csv_importer.py          # Unit tests (13 tests)
│   └── __pycache__/                  # Python bytecode cache
│
└── instructions/                     # Project instructions
    ├── README.md                     # Instructions documentation
    └── data/                         # Data files
        └── customers.csv             # Customer data source (1000 records)
```

## Overview

This project consists of two main components:

1. **Python CSV Importer** - A robust Python module that imports customer data from CSV into SQLite
2. **Next.js Web Application** - A full-stack web app with REST API and interactive UI for browsing customers

---

# CSV to SQLite Importer

A Python module for importing CSV files into SQLite databases with comprehensive error handling and unit tests.
## Features

- Import CSV data into SQLite databases
- Automatic table creation based on CSV headers
- Data validation and integrity checks
- Comprehensive error handling
- Full test coverage with passing and failing test cases

## Installation

No external dependencies required. Uses Python standard library modules:
- `csv`
- `sqlite3`
- `unittest`
- `os`
- `tempfile`

## Usage

### Command Line

Import the customer data:

```bash
python data-importer/csv_importer.py
```

This will:
- Read the CSV file from `instructions/data/customers.csv`
- Create a SQLite database at `customers.db` in the project root
- Import all customer records into the `customers` table

### Programmatic Usage

```python
from data_importer import CSVImporter

# Create importer instance
importer = CSVImporter("path/to/database.db")

# Connect to database
importer.connect()

# Import CSV file
row_count = importer.import_csv("path/to/file.csv", "table_name")
print(f"Imported {row_count} rows")

# Query data
results = importer.execute_query("SELECT * FROM table_name LIMIT 10")

# Get row count
count = importer.get_row_count("table_name")

# Disconnect
importer.disconnect()
```

## Running Tests

Run all unit tests:

```bash
cd data-importer
python test_csv_importer.py
```

### Test Coverage

The test suite includes:

**Passing Tests:**
- Database connection establishment
- Successful CSV import
- Row count verification
- Data integrity checks
- Table creation validation
- Database file creation
- Empty CSV handling

**Failing Tests (Error Handling):**
- Import from non-existent CSV file (FileNotFoundError)
- Operations without database connection (RuntimeError)
- Creating tables without connection (RuntimeError)
- Querying without connection (RuntimeError)

**Integration Tests:**
- Full customer data import from actual CSV
- Data validation for real-world scenarios

All tests use temporary directories and cleanup automatically.

## API Reference

### CSVImporter

#### `__init__(db_path: str)`
Initialize the importer with a database path.

#### `connect() -> None`
Establish connection to the SQLite database.

#### `disconnect() -> None`
Close the database connection.

#### `import_csv(csv_path: str, table_name: str) -> int`
Import data from a CSV file into the database. Returns the number of rows imported.

Raises:
- `FileNotFoundError`: If CSV file doesn't exist
- `RuntimeError`: If database connection not established

#### `get_row_count(table_name: str) -> int`
Get the number of rows in a table.

#### `execute_query(query: str) -> list`
Execute a SELECT query and return results.

#### `create_table(table_name: str, columns: list[str]) -> None`
Create a table in the database.

## Project Structure

```
data-importer/
├── __init__.py           # Package initialization
├── csv_importer.py       # Main importer module
└── test_csv_importer.py  # Unit tests
```

## Output

The SQLite database is saved to the project root directory as `customers.db`.

## Test Results

```
Ran 13 tests in 0.174s
OK
```

All tests pass successfully, including:
- 7 passing tests (normal operations)
- 5 failing tests (error handling validation)
- 1 integration test (actual customer data)

# Customers API / Web App
A web / API application built on top of NextJS framework featuring a dynamic customer datatable with filtering, search, and pagination capabilities.

### Frontend Libraries
- Tailwind CSS
- ShadCN UI
- React Testing Library

### Features
- **Interactive DataTable**: Displays customer data with sorting and pagination
- **Real-time Search**: Filter customers by name or email
- **Gender Filtering**: Filter customers by gender (Male, Female, Other)
- **Pagination Controls**: Navigate through pages with customizable items per page (5, 10, 25, 50, 100)
- **Responsive Design**: Mobile-friendly layout with adaptive controls
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Visual feedback during data fetching

### Installation
- Go to `app` directory and run npm install
``` bash
cd app
npm install
```
- Run dev server
``` bash
npm run dev
```
- NOTE: If the browser does not open after the build, you can manually go to `http://localhost:3000`.

### GET /api/customers

Returns a paginated list of customers with optional filtering.

#### Query Parameters

- `page` - Page number (default: 1, min: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search by first name, last name, or email
- `gender` - Filter by gender (Male, Female, Other)

#### Response Format

```json
{
  "data": [
    {
      "id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "gender": "string",
      "ip_address": "string",
      "company": "string",
      "city": "string",
      "title": "string",
      "website": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Running API Tests

```bash
cd app
npm test -- route.test.ts
```

### Test Results

```
Test Suites: 1 passed, 1 total
Tests:       31 passed, 31 total
```

#### Test Coverage

The comprehensive test suite includes **31 passing tests** covering:

**Successful Responses (3 tests)**
- Default pagination
- Custom pagination
- Cache-Control headers

**Pagination Scenarios (8 tests)**
- First/middle/last page handling
- Maximum limit enforcement (100)
- Empty results
- Correct LIMIT/OFFSET calculations

**Search Filtering (3 tests)**
- Filter by search term
- SQL injection protection (sanitization)
- Whitespace trimming

**Gender Filtering (3 tests)**
- Valid gender values (Male, Female, Other)
- Invalid gender rejection

**Combined Filters (2 tests)**
- Search + gender with AND logic
- Multiple filters + pagination

**Error Handling (4 tests)**
- Database connection errors
- Query failures
- Non-Error exceptions
- Null result handling

**Input Validation Edge Cases (5 tests)**
- Negative/zero/non-numeric inputs
- Empty/whitespace-only searches

**Response Structure Validation (2 tests)**
- Correct JSON structure
- All required customer fields

**Database Query Verification (4 tests)**
- COUNT and data queries
- Column selection
- ORDER BY clause
- LIMIT/OFFSET parameters

All tests use Jest with mocked database connections for isolated testing.
