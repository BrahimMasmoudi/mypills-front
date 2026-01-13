import sqlite3
import json

def infer_route(form):
    """
    Helper to guess administration route based on the form text.
    The database doesn't have this, so we deduce it for the UI.
    """
    if not form:
        return ["Voie indéterminée"]

    f = form.lower()
    if any(x in f for x in ['comprimé', 'gélule', 'sirop', 'sachet', 'capsule', 'orale', 'solution buvable']):
        return ["Voie orale"]
    if 'injectable' in f or 'injection' in f or 'perfusion' in f:
        return ["Voie injectable"]
    if 'crème' in f or 'pommade' in f or 'gel' in f or 'cutanée' in f:
        return ["Voie cutanée"]
    if 'collyre' in f or 'ophtalmique' in f:
        return ["Voie ophtalmique"]
    if 'nasal' in f:
        return ["Voie nasale"]
    if 'rectal' in f or 'suppositoire' in f:
        return ["Voie rectale"]

    return ["Voie indéterminée"]

def convert_db_to_component_format(db_name, json_filename):
    try:
        conn = sqlite3.connect(db_name)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        final_data = {}

        for table in tables:
            table_name = table[0]
            print(f"Processing table: {table_name}...")

            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()

            table_records = []
            for row in rows:
                raw = dict(row)

                # 1. Extract raw values (handling potential NULLs safely)
                raw_id = raw.get("id", 0)
                raw_name = raw.get("specialite", "Unknown") or "Unknown"
                raw_strength = raw.get("dosage", "") or ""
                raw_form = raw.get("forme", "") or ""
                raw_presentation = raw.get("presentation", "") or ""
                raw_packaging = raw.get("conditionnement", "") or ""
                raw_spec = raw.get("specification", "") or ""
                raw_dci = raw.get("dci", "") or ""
                raw_manufacturer = raw.get("laboratoire", "") or ""

                # 2. Build the 'presentations' object for the UI
                # Combine info into a readable label: "B/30 (Blister en PVC-PVDC-Alu)"
                presentation_label = f"{raw_presentation} ({raw_packaging} {raw_spec})".strip()
                presentation_label = presentation_label.replace("()", "").strip()

                presentation_obj = {
                    "label": presentation_label,
                    "barcode13": 0,                # Placeholder
                    "refundRate": "Non défini",    # Placeholder
                    "price": 0                     # Placeholder
                }

                # 3. Build the 'ingredients' object
                ingredient_obj = {
                    "substance": raw_dci,
                    "dosage": raw_strength,
                    "reference": ""
                }

                # 4. Construct the final nested structure
                structured_record = {
                    "name": f"{raw_name} {raw_strength}".strip(), # UI Title
                    "cis": raw_id,
                    "details": {
                        "form": raw_form,
                        "administrationRoutes": infer_route(raw_form),
                        "authStatus": "Autorisée",
                        "procedureType": "Nationale",
                        "marketingStatus": "Commercialisée",
                        "approvalDate": "",
                        "company": raw_manufacturer,
                        "enhancedSurveillance": False,
                        "ingredients": [ingredient_obj],
                        "presentations": [presentation_obj]
                    }
                }

                table_records.append(structured_record)

            final_data[table_name] = table_records

        # Write to JSON
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, indent=4, ensure_ascii=False)

        print(f"Successfully converted {db_name} to {json_filename} matching MedicationDetails interface.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    convert_db_to_component_format('tn_db.db', 'medication_data.json')