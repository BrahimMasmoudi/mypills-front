import json
import os

def convert_txt_to_json():
    # Define paths relative to the script execution location (assumed root of project or similar, mostly we'll run from project root)
    input_path = 'front/public/CIS_CIP_bdpm.txt'
    output_path = 'front/public/cip13_cis_mapping.json'

    if not os.path.exists(input_path):
        print(f"Error: Input file not found at {input_path}")
        return

    mapping = {}
    
    try:
        with open(input_path, 'r', encoding='latin-1') as f: # BDPM files are often latin-1 or cp1252
            for line in f:
                columns = line.strip().split('\t')
                if len(columns) > 6:
                    cis = columns[0].strip()
                    cip13 = columns[6].strip()
                    
                    # Store mapping CIP13 -> CIS
                    if cip13 and cis:
                        mapping[cip13] = cis
                        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, ensure_ascii=False) # Minimize file size, no indent
            
        print(f"Successfully converted {len(mapping)} entries to {output_path}")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    convert_txt_to_json()
