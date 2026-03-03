"""
Unit tests for CSV to SQLite importer.

This module contains both passing and failing tests to verify the CSV importer
functionality.
"""

import unittest
import os
import tempfile
import shutil
from csv_importer import CSVImporter


class TestCSVImporterPassing(unittest.TestCase):
    """Test cases that should pass."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create temporary directory for test database
        self.test_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.test_dir, "test.db")
        
        # Create a temporary CSV file for testing
        self.csv_path = os.path.join(self.test_dir, "test_data.csv")
        with open(self.csv_path, 'w', encoding='utf-8') as f:
            f.write("id,name,email,age\n")
            f.write("1,John Doe,john@example.com,30\n")
            f.write("2,Jane Smith,jane@example.com,25\n")
            f.write("3,Bob Johnson,bob@example.com,35\n")
        
        self.importer = CSVImporter(self.db_path)
        
    def tearDown(self):
        """Clean up test fixtures."""
        self.importer.disconnect()
        shutil.rmtree(self.test_dir)
        
    def test_connection(self):
        """Test database connection establishment."""
        self.importer.connect()
        self.assertIsNotNone(self.importer.connection)
        self.importer.disconnect()
        self.assertIsNone(self.importer.connection)
        
    def test_import_csv_success(self):
        """Test successful CSV import."""
        self.importer.connect()
        row_count = self.importer.import_csv(self.csv_path, "test_table")
        
        self.assertEqual(row_count, 3, "Should import 3 rows")
        
    def test_row_count(self):
        """Test row count retrieval."""
        self.importer.connect()
        self.importer.import_csv(self.csv_path, "test_table")
        
        count = self.importer.get_row_count("test_table")
        self.assertEqual(count, 3, "Table should have 3 rows")
        
    def test_data_integrity(self):
        """Test that imported data matches source CSV."""
        self.importer.connect()
        self.importer.import_csv(self.csv_path, "test_table")
        
        results = self.importer.execute_query("SELECT * FROM test_table ORDER BY id")
        
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0][1], "John Doe")
        self.assertEqual(results[1][2], "jane@example.com")
        self.assertEqual(results[2][3], "35")
        
    def test_table_creation(self):
        """Test that table is created with correct columns."""
        self.importer.connect()
        self.importer.import_csv(self.csv_path, "test_table")
        
        # Query table schema
        cursor = self.importer.connection.cursor()
        cursor.execute("PRAGMA table_info(test_table)")
        columns = cursor.fetchall()
        
        column_names = [col[1] for col in columns]
        self.assertEqual(column_names, ["id", "name", "email", "age"])
        
    def test_database_file_created(self):
        """Test that database file is created on disk."""
        self.assertFalse(os.path.exists(self.db_path))
        self.importer.connect()
        self.assertTrue(os.path.exists(self.db_path))
        
    def test_empty_csv(self):
        """Test importing an empty CSV (header only)."""
        empty_csv = os.path.join(self.test_dir, "empty.csv")
        with open(empty_csv, 'w', encoding='utf-8') as f:
            f.write("id,name\n")
        
        self.importer.connect()
        row_count = self.importer.import_csv(empty_csv, "empty_table")
        
        self.assertEqual(row_count, 0, "Should import 0 rows from empty CSV")


class TestCSVImporterFailing(unittest.TestCase):
    """Test cases that should fail to verify error handling."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.test_dir, "test.db")
        self.importer = CSVImporter(self.db_path)
        
    def tearDown(self):
        """Clean up test fixtures."""
        self.importer.disconnect()
        shutil.rmtree(self.test_dir)
        
    def test_import_nonexistent_csv(self):
        """Test that importing non-existent CSV raises FileNotFoundError."""
        self.importer.connect()
        
        with self.assertRaises(FileNotFoundError):
            self.importer.import_csv("nonexistent.csv", "test_table")
            
    def test_import_without_connection(self):
        """Test that importing without connection raises RuntimeError."""
        csv_path = os.path.join(self.test_dir, "test.csv")
        with open(csv_path, 'w') as f:
            f.write("id,name\n1,Test\n")
        
        # Don't connect - should raise error
        with self.assertRaises(RuntimeError):
            self.importer.import_csv(csv_path, "test_table")
            
    def test_get_row_count_without_connection(self):
        """Test that getting row count without connection raises RuntimeError."""
        with self.assertRaises(RuntimeError):
            self.importer.get_row_count("test_table")
            
    def test_execute_query_without_connection(self):
        """Test that executing query without connection raises RuntimeError."""
        with self.assertRaises(RuntimeError):
            self.importer.execute_query("SELECT * FROM test_table")
            
    def test_create_table_without_connection(self):
        """Test that creating table without connection raises RuntimeError."""
        with self.assertRaises(RuntimeError):
            self.importer.create_table("test_table", ["id", "name"])


class TestCustomerDataImport(unittest.TestCase):
    """Integration test for the actual customer data."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.test_dir, "customers.db")
        
        # Get path to actual customer CSV
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        self.csv_path = os.path.join(project_root, "instructions", "data", "customers.csv")
        
        self.importer = CSVImporter(self.db_path)
        
    def tearDown(self):
        """Clean up test fixtures."""
        self.importer.disconnect()
        shutil.rmtree(self.test_dir)
        
    def test_import_customer_data(self):
        """Test importing the actual customer CSV data."""
        if not os.path.exists(self.csv_path):
            self.skipTest(f"Customer CSV not found at {self.csv_path}")
        
        self.importer.connect()
        row_count = self.importer.import_csv(self.csv_path, "customers")
        
        # The CSV has 1002 lines (1 header + 1001 data rows)
        self.assertGreater(row_count, 0, "Should import at least some rows")
        
        # Verify row count matches
        db_row_count = self.importer.get_row_count("customers")
        self.assertEqual(row_count, db_row_count)
        
        # Verify first customer
        results = self.importer.execute_query(
            "SELECT first_name, last_name, email FROM customers WHERE id = '1'"
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0][0], "Laura")
        self.assertEqual(results[0][1], "Richards")


def run_tests():
    """Run all tests and display results."""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestCSVImporterPassing))
    suite.addTests(loader.loadTestsFromTestCase(TestCSVImporterFailing))
    suite.addTests(loader.loadTestsFromTestCase(TestCustomerDataImport))
    
    # Run tests with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result


if __name__ == "__main__":
    run_tests()
