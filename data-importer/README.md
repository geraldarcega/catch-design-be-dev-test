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
