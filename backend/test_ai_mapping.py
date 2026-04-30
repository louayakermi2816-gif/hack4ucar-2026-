"""Test the AI field mapping pipeline end-to-end"""
import httpx
import json

BASE = "http://localhost:8000"

# Step 1: Login as admin
print("=== Step 1: Logging in as admin ===")
login = httpx.post(f"{BASE}/api/auth/login", data={
    "username": "admin@ucar.tn",
    "password": "admin123"
})
print(f"Login status: {login.status_code}")
token = login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"Got token!")

# Step 2: Get a real institution UUID
print("\n=== Step 2: Getting institution UUID ===")
inst = httpx.get(f"{BASE}/api/institutions", headers=headers)
institutions = inst.json()
inst_id = str(institutions[0]["id"])
inst_name = institutions[0]["name"]
print(f"Using institution: {inst_name} (ID: {inst_id})")

# Step 3: Upload the French PDF
print("\n=== Step 3: Uploading French PDF ===")
print("This PDF has French columns: 'Semestre', 'Taux de reussite', \"Taux d'abandon\"")
print("Our schema expects: 'semester', 'success_rate', 'dropout_rate'")
print("Mistral AI should figure out the mapping...\n")

with open("/data/test_french.pdf", "rb") as f:
    resp = httpx.post(
        f"{BASE}/api/upload",
        headers=headers,
        files={"file": ("test_french.pdf", f, "application/pdf")},
        data={"institution_id": inst_id},
        timeout=60.0
    )

print(f"Upload status: {resp.status_code}")
result = resp.json()
print(json.dumps(result, indent=2))

if result.get("ai_assisted"):
    print("\n🤖 AI MAPPING SUCCESSFUL!")
    print(f"   Confidence: {result['ai_confidence']:.0%}")
    print(f"   Original columns: {result['original_columns']}")
    print(f"   Mapped columns:   {result['columns_detected']}")
    print(f"   Data type:        {result['data_type']}")
    print(f"   Rows inserted:    {result['rows_inserted']}")
elif result.get("status") == "success":
    print("\n✅ Upload successful (keyword detection was enough)")
else:
    print("\n❌ Upload failed")
