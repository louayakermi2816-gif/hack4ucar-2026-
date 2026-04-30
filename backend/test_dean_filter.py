"""Test Dean persona filtering — compare President vs Dean views"""
import httpx
import json

BASE = "http://localhost:8000"

def login(email, password):
    resp = httpx.post(f"{BASE}/api/auth/login", data={"username": email, "password": password})
    return resp.json()["access_token"]

def get(endpoint, token):
    resp = httpx.get(f"{BASE}{endpoint}", headers={"Authorization": f"Bearer {token}"})
    return resp.json()

# Login as both roles
print("=" * 60)
print("DEAN PERSONA FILTERING TEST")
print("=" * 60)

president_token = login("president@ucar.tn", "president123")
dean_token = login("dean@ucar.tn", "dean123")

# Compare overview
print("\n--- /api/dashboard/overview ---")
pres_overview = get("/api/dashboard/overview", president_token)
dean_overview = get("/api/dashboard/overview", dean_token)

print(f"  President sees: {pres_overview['total_institutions']} institutions (viewing_as: {pres_overview.get('viewing_as', 'N/A')})")
print(f"  Dean sees:      {dean_overview['total_institutions']} institution  (viewing_as: {dean_overview.get('viewing_as', 'N/A')})")

# Compare institutions list
print("\n--- /api/institutions ---")
pres_inst = get("/api/institutions", president_token)
dean_inst = get("/api/institutions", dean_token)
print(f"  President sees: {len(pres_inst)} institutions")
print(f"  Dean sees:      {len(dean_inst)} institution(s)")
if dean_inst:
    print(f"  Dean's campus:  {dean_inst[0]['name']}")

# Compare ranking
print("\n--- /api/dashboard/ranking ---")
pres_rank = get("/api/dashboard/ranking?metric=success_rate&limit=5", president_token)
dean_rank = get("/api/dashboard/ranking?metric=success_rate&limit=5", dean_token)
print(f"  President sees: {len(pres_rank)} institutions in ranking")
print(f"  Dean sees:      {len(dean_rank)} institution(s) in ranking")

print("\n" + "=" * 60)
print("RESULT: Dean persona filtering is WORKING!" if len(dean_inst) < len(pres_inst) else "RESULT: Something is wrong...")
print("=" * 60)
