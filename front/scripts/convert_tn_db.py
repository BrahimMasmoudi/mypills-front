import sqlite3
import json

def convert_db_to_json(db_name, json_filename):
    # List of keys you want to exclude
    keys_to_remove = ["_id", "tableau", "amm", "dateamm"]

    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_name)

        # This allows us to access columns by name
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 1. Get a list of all tables in the database
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        final_data = {}

        for table in tables:
            table_name = table[0]
            print(f"Reading table: {table_name}...")

            # 2. Select all data from the table
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()

            table_records = []
            for row in rows:
                # Convert the SQLite Row object to a standard Python dictionary
                row_dict = dict(row)

                # 3. Remove the unwanted keys if they exist in this row
                for key in keys_to_remove:
                    row_dict.pop(key, None)

                table_records.append(row_dict)

            final_data[table_name] = table_records

        # 4. Write the cleaned data to a JSON file
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, indent=4, ensure_ascii=False)

        print(f"Successfully created {json_filename}")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:
            conn.close()

# Usage
if __name__ == "__main__":
    convert_db_to_json('tn_db.db', 'cleaned_data.json')