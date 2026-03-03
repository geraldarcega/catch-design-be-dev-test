"""
CSV to SQLite Importer

This module provides functionality to import CSV files into a SQLite database.
"""

import csv
import sqlite3
import os
from typing import Optional


class CSVImporter:
    """Handles importing CSV data into SQLite database."""
    
    def __init__(self, db_path: str):
        """
        Initialize the CSV importer.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.connection = None
        
    def connect(self) -> None:
        """Establish connection to the SQLite database."""
        self.connection = sqlite3.connect(self.db_path)
        
    def disconnect(self) -> None:
        """Close the database connection."""
        if self.connection:
            self.connection.close()
            self.connection = None
            
    def create_table(self, table_name: str, columns: list[str]) -> None:
        """
        Create a table in the database.
        
        Args:
            table_name: Name of the table to create
            columns: List of column names
        """
        if not self.connection:
            raise RuntimeError("Database connection not established. Call connect() first.")
        
        # Create column definitions (all as TEXT for simplicity)
        column_defs = ", ".join([f"{col} TEXT" for col in columns])
        
        cursor = self.connection.cursor()
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        cursor.execute(f"CREATE TABLE {table_name} ({column_defs})")
        self.connection.commit()
        
    def import_csv(self, csv_path: str, table_name: str) -> int:
        """
        Import data from a CSV file into the database.
        
        Args:
            csv_path: Path to the CSV file
            table_name: Name of the table to import into
            
        Returns:
            Number of rows imported
            
        Raises:
            FileNotFoundError: If CSV file doesn't exist
            RuntimeError: If database connection not established
        """
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
            
        if not self.connection:
            raise RuntimeError("Database connection not established. Call connect() first.")
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            csv_reader = csv.reader(f)
            headers = next(csv_reader)
            
            # Create table with columns from CSV header
            self.create_table(table_name, headers)
            
            # Prepare INSERT statement
            placeholders = ", ".join(["?" for _ in headers])
            insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders})"
            
            # Import rows
            cursor = self.connection.cursor()
            rows = list(csv_reader)
            cursor.executemany(insert_sql, rows)
            self.connection.commit()
            
            return len(rows)
    
    def get_row_count(self, table_name: str) -> int:
        """
        Get the number of rows in a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Number of rows in the table
        """
        if not self.connection:
            raise RuntimeError("Database connection not established. Call connect() first.")
        
        cursor = self.connection.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        return cursor.fetchone()[0]
    
    def execute_query(self, query: str) -> list:
        """
        Execute a SELECT query and return results.
        
        Args:
            query: SQL query to execute
            
        Returns:
            List of result rows
        """
        if not self.connection:
            raise RuntimeError("Database connection not established. Call connect() first.")
        
        cursor = self.connection.cursor()
        cursor.execute(query)
        return cursor.fetchall()


def main():
    """Main function to run the CSV import."""
    # Get the project root directory (parent of data-importer)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Define paths
    csv_path = os.path.join(project_root, "instructions", "data", "customers.csv")
    db_path = os.path.join(project_root, "customers.db")
    
    # Create importer and import data
    importer = CSVImporter(db_path)
    
    try:
        importer.connect()
        print(f"Importing CSV from: {csv_path}")
        print(f"Database location: {db_path}")
        
        row_count = importer.import_csv(csv_path, "customers")
        
        print(f"Successfully imported {row_count} rows into the 'customers' table")
        print(f"Database saved to: {db_path}")
        
    except Exception as e:
        print(f"Error during import: {e}")
        raise
    finally:
        importer.disconnect()


if __name__ == "__main__":
    main()
