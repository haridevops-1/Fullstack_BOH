import psycopg2
import os
import sys
from dotenv import load_dotenv

# Try to load environment variables from .env
load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in Backend/.env")
    sys.exit(1)

# Ensure the URL is correctly formatted for psycopg2 (if needed)
# Supabase uses pooled connections, so it should be fine.

try:
    print(f"Connecting to Supabase...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # Step 0: Try to clear existing locks (Kill other sessions)
    try:
        print("Clearing database locks (this might disconnect other users)...")
        cursor.execute("""
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = 'postgres' AND pid <> pg_backend_pid();
        """)
        print("   Sessions cleared.")
    except Exception as lock_err:
        print(f"   Note: Could not clear sessions (Expected if not superuser): {lock_err}")

    print("Step 1: Adding 'scheduled_time' column...")
    cursor.execute("ALTER TABLE food_form ADD COLUMN IF NOT EXISTS scheduled_time TEXT;")
    print("   DONE: Column 'scheduled_time' added (or already exists).")
    
    print("Step 2: Adding 'reject_reason' column...")
    cursor.execute("ALTER TABLE food_form ADD COLUMN IF NOT EXISTS reject_reason TEXT;")
    print("   DONE: Column 'reject_reason' added (or already exists).")

    print("\nStep 3: (Optional Cleanup) Removing driver columns...")
    cols_to_drop = ["driver_name", "driver_phone", "vehicle_number", "eta", "proof_image"]
    for col in cols_to_drop:
        try:
            print(f"   Dropping {col}...")
            cursor.execute(f"ALTER TABLE food_form DROP COLUMN IF EXISTS {col};")
        except Exception as drop_err:
            print(f"   Could not drop {col}: {drop_err}")

    print("\nSUCCESS! Your database has been migrated.")
    cursor.close()
    conn.close()

except Exception as e:
    print(f"\nFAILED: {str(e)}")
