"""
seed.py — Université de Carthage: all 32 institutions with realistic KPI data.
Run:  docker compose exec backend python seed.py
"""
import uuid
import random
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.models import (
    Institution, AcademicRecord, EmploymentRecord,
    FinanceRecord, EsgRecord, HrRecord, ResearchRecord,
    InfrastructureRecord, PartnershipRecord, Alert
)

DATABASE_URL = "postgresql://hack4ucar:secret@db:5432/hack4ucar_db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

now = datetime.now(timezone.utc)
random.seed(42)  # reproducible results

# ── Clear old data ────────────────────────────────────────────────────────
print("Clearing old data...")
for table in [
    "alerts", "chat_messages", "chat_sessions", "reports",
    "partnership_records", "infrastructure_records", "research_records",
    "hr_records", "esg_records", "finance_records",
    "employment_records", "academic_records", "documents", "institutions"
]:
    db.execute(text(f"DELETE FROM {table}"))
db.commit()
print("  Done.\n")

# ── All 32 UCAR institutions ─────────────────────────────────────────────
INSTITUTIONS = [
    # (name, type, location)
    ("Faculté des Sciences Juridiques, Politiques et Sociales de Tunis", "faculté", "Tunis"),
    ("Faculté des Sciences de Bizerte", "faculté", "Bizerte"),
    ("Faculté des Sciences Economiques et de Gestion de Nabeul", "faculté", "Nabeul"),
    ("École Nationale d'Architecture et d'Urbanisme de Tunis", "école", "Tunis"),
    ("École Polytechnique de Tunisie", "école", "Tunis"),
    ("École Nationale d'Ingénieurs de Carthage", "école", "Tunis"),
    ("École Supérieure des Statistiques et d'Analyse de l'Information", "école", "Tunis"),
    ("École Supérieure de l'Audiovisuel et du Cinéma de Gammarth", "école", "Gammarth"),
    ("École Supérieure des Communications de Tunis", "école", "Tunis"),
    ("École Supérieure d'Agriculture de Mograne", "école", "Mograne"),
    ("École Supérieure d'Agriculture de Mateur", "école", "Mateur"),
    ("École Supérieure des Industries Alimentaires de Tunis", "école", "Tunis"),
    ("École Nationale des Sciences et Technologies Avancées de Borj Cédria", "école", "Borj Cédria"),
    ("École Nationale d'Ingénieurs de Bizerte", "école", "Bizerte"),
    ("Institut Préparatoire aux Etudes d'Ingénieur de Bizerte", "institut", "Bizerte"),
    ("Institut des Hautes Etudes Commerciales de Carthage", "institut", "Tunis"),
    ("Institut National des Sciences Appliquées et de Technologie", "institut", "Tunis"),
    ("Institut Supérieur des Sciences Appliquées et de la Technologie de Mateur", "institut", "Mateur"),
    ("Institut Préparatoire aux Etudes d'Ingénieur de Nabeul", "institut", "Nabeul"),
    ("Institut Préparatoire aux Etudes Scientifiques et Techniques de la Marsa", "institut", "La Marsa"),
    ("Institut Supérieur des Beaux Arts de Nabeul", "institut", "Nabeul"),
    ("Institut Supérieur des Technologies de l'Environnement, de l'Urbanisme et du Bâtiment", "institut", "Tunis"),
    ("Institut Supérieur des Langues de Tunis", "institut", "Tunis"),
    ("Institut Supérieur des Langues Appliquées et d'Informatique de Nabeul", "institut", "Nabeul"),
    ("Institut Supérieur des Sciences et Technologies de l'Environnement de Borj Cédria", "institut", "Borj Cédria"),
    ("Institut Supérieur de Gestion de Bizerte", "institut", "Bizerte"),
    ("Institut Supérieur des Etudes Préparatoires en Biologie et Géologie de Soukra", "institut", "Soukra"),
    ("Institut National du Travail et des Etudes Sociales de Tunis", "institut", "Tunis"),
    ("Institut Supérieur des Cadres de l'Enfance", "institut", "Tunis"),
    ("Institut National Agronomique de Tunis", "institut", "Tunis"),
    ("Institut des Hautes Etudes Touristiques de Sidi Dhrif", "institut", "Sidi Dhrif"),
    ("Institut Supérieur des Technologies de l'Information et des Communications", "institut", "Borj Cédria"),
    ("Institut Supérieur de Pêche et d'Aquaculture de Bizerte", "institut", "Bizerte"),
    ("École Nationale d'Ingénieurs de Bizerte", "école", "Bizerte"),
]

# Remove duplicates (ENIB appears twice in the official list)
seen = set()
unique_institutions = []
for name, itype, loc in INSTITUTIONS:
    if name not in seen:
        seen.add(name)
        unique_institutions.append((name, itype, loc))

# ── Insert institutions ───────────────────────────────────────────────────
print("Inserting institutions...")
institutions = []
for name, itype, loc in unique_institutions:
    inst = Institution(
        id=uuid.uuid4(), name=name,
        institution_type=itype, location=loc, created_at=now
    )
    db.add(inst)
    institutions.append(inst)
    print(f"  + {name}")

print(f"\n  Total: {len(institutions)} institutions\n")


# ── Helper: generate realistic variation ──────────────────────────────────
def vary(base, pct=15):
    """Return base ± pct% variation."""
    return round(base * random.uniform(1 - pct/100, 1 + pct/100), 1)


# ── Academic Records (2 semesters per institution) ────────────────────────
print("Inserting academic records...")
semesters = ["S1-2025", "S2-2025"]

# Base rates by institution type
base_rates = {
    "école":    {"success": 76, "attendance": 85, "repetition": 11, "dropout": 5},
    "faculté":  {"success": 65, "attendance": 74, "repetition": 18, "dropout": 12},
    "institut": {"success": 71, "attendance": 80, "repetition": 14, "dropout": 8},
}

for inst in institutions:
    rates = base_rates[inst.institution_type]
    for sem in semesters:
        db.add(AcademicRecord(
            id=uuid.uuid4(), institution_id=inst.id, semester=sem,
            success_rate=vary(rates["success"]),
            attendance_rate=vary(rates["attendance"]),
            repetition_rate=vary(rates["repetition"]),
            dropout_rate=vary(rates["dropout"]),
        ))
print(f"  + {len(institutions) * 2} academic records")


# ── Employment Records (2 years per institution) ─────────────────────────
print("Inserting employment records...")
base_employment = {
    "école":    {"rate": 72, "delay": 110, "nat": 14, "intl": 6},
    "faculté":  {"rate": 55, "delay": 175, "nat": 8,  "intl": 3},
    "institut": {"rate": 62, "delay": 145, "nat": 10, "intl": 4},
}

for inst in institutions:
    emp = base_employment[inst.institution_type]
    for year in [2024, 2025]:
        db.add(EmploymentRecord(
            id=uuid.uuid4(), institution_id=inst.id, year=year,
            employability_rate=vary(emp["rate"]),
            insertion_delay_days=int(vary(emp["delay"])),
            national_conventions=int(vary(emp["nat"], 30)),
            international_conventions=int(vary(emp["intl"], 30)),
        ))
print(f"  + {len(institutions) * 2} employment records")


# ── Finance Records (2 quarters per institution) ─────────────────────────
print("Inserting finance records...")
base_finance = {
    "école":    {"budget": 3200000, "consumed_pct": 82, "cost": 2800},
    "faculté":  {"budget": 4500000, "consumed_pct": 88, "cost": 2200},
    "institut": {"budget": 2800000, "consumed_pct": 85, "cost": 2500},
}

departments = {
    "école":    ["Ingénierie", "Sciences", "Architecture", "Agriculture", "Technologies"],
    "faculté":  ["Sciences", "Droit", "Économie", "Gestion"],
    "institut": ["Sciences Appliquées", "Technologies", "Langues", "Gestion"],
}

periods = ["Q1-2025", "Q2-2025"]
for inst in institutions:
    fin = base_finance[inst.institution_type]
    dept_list = departments[inst.institution_type]
    for period in periods:
        allocated = vary(fin["budget"], 20)
        db.add(FinanceRecord(
            id=uuid.uuid4(), institution_id=inst.id, period=period,
            budget_allocated=allocated,
            budget_consumed=round(allocated * fin["consumed_pct"] / 100 * random.uniform(0.9, 1.1)),
            cost_per_student=vary(fin["cost"]),
            department=random.choice(dept_list),
        ))
print(f"  + {len(institutions) * 2} finance records")


# ── ESG Records (2 periods per institution) ───────────────────────────────
print("Inserting ESG records...")
mobility_types = ["bus", "car", "walk", "métro"]

for inst in institutions:
    for period in periods:
        db.add(EsgRecord(
            id=uuid.uuid4(), institution_id=inst.id, period=period,
            energy_kwh=vary(95000, 30),
            carbon_kg=vary(37000, 30),
            recycling_rate=vary(30, 40),
            mobility_type=random.choice(mobility_types),
        ))
print(f"  + {len(institutions) * 2} ESG records")


# ── HR Records (2 periods per institution) ────────────────────────────────
print("Inserting HR records...")
base_hr = {
    "école":    {"teach": 120, "admin": 65, "absent": 3.8, "training": 110},
    "faculté":  {"teach": 280, "admin": 160, "absent": 5.2, "training": 80},
    "institut": {"teach": 90,  "admin": 50, "absent": 4.5, "training": 95},
}

for inst in institutions:
    hr = base_hr[inst.institution_type]
    for period in periods:
        db.add(HrRecord(
            id=uuid.uuid4(), institution_id=inst.id, period=period,
            teaching_staff_count=int(vary(hr["teach"], 25)),
            admin_staff_count=int(vary(hr["admin"], 25)),
            absenteeism_rate=vary(hr["absent"], 20),
            training_hours=int(vary(hr["training"], 20)),
        ))
print(f"  + {len(institutions) * 2} HR records")


# ── Research Records (2 years per institution) ────────────────────────────
print("Inserting research records...")
base_research = {
    "école":    {"pubs": 65, "projects": 10, "funding": 420000, "patents": 3},
    "faculté":  {"pubs": 85, "projects": 14, "funding": 550000, "patents": 2},
    "institut": {"pubs": 35, "projects": 6,  "funding": 250000, "patents": 1},
}

for inst in institutions:
    res = base_research[inst.institution_type]
    for year in [2024, 2025]:
        db.add(ResearchRecord(
            id=uuid.uuid4(), institution_id=inst.id, year=year,
            publications=int(vary(res["pubs"], 25)),
            active_projects=int(vary(res["projects"], 30)),
            funding_secured=vary(res["funding"], 25),
            patents=max(0, int(vary(res["patents"], 50))),
        ))
print(f"  + {len(institutions) * 2} research records")


# ── Infrastructure Records (1 period per institution) ─────────────────────
print("Inserting infrastructure records...")
statuses = ["good", "fair", "poor"]
status_weights = [0.4, 0.4, 0.2]

for inst in institutions:
    db.add(InfrastructureRecord(
        id=uuid.uuid4(), institution_id=inst.id, period="Q1-2025",
        room_occupancy_rate=vary(75, 15),
        equipment_status=random.choices(statuses, status_weights)[0],
        ongoing_works=random.randint(0, 6),
    ))
print(f"  + {len(institutions)} infrastructure records")


# ── Partnership Records (1 per institution) ───────────────────────────────
print("Inserting partnership records...")
base_partner = {
    "école":    {"agreements": 16, "incoming": 35, "outgoing": 28},
    "faculté":  {"agreements": 12, "incoming": 20, "outgoing": 15},
    "institut": {"agreements": 8,  "incoming": 12, "outgoing": 10},
}

for inst in institutions:
    par = base_partner[inst.institution_type]
    db.add(PartnershipRecord(
        id=uuid.uuid4(), institution_id=inst.id,
        active_agreements=int(vary(par["agreements"], 30)),
        incoming_mobility=int(vary(par["incoming"], 30)),
        outgoing_mobility=int(vary(par["outgoing"], 30)),
    ))
print(f"  + {len(institutions)} partnership records")


# ── Alerts (realistic anomalies) ─────────────────────────────────────────
print("Inserting alerts...")

# Find institutions with concerning data patterns
alert_data = [
    {
        "institution_id": institutions[0].id,  # FSJPST
        "kpi_domain": "academic",
        "severity": "HIGH",
        "message_fr": "Taux d'abandon supérieur à 15% détecté au S2-2025 — intervention recommandée",
        "message_ar": "تم اكتشاف معدل تسرب يتجاوز 15% في الفصل الثاني 2025 — يُوصى بالتدخل",
    },
    {
        "institution_id": institutions[2].id,  # FSEGN
        "kpi_domain": "finance",
        "severity": "MEDIUM",
        "message_fr": "Budget consommé à 94% au Q1 — risque de dépassement budgétaire",
        "message_ar": "تم استهلاك 94% من الميزانية في الربع الأول — خطر تجاوز الميزانية",
    },
    {
        "institution_id": institutions[4].id,  # EPT
        "kpi_domain": "hr",
        "severity": "LOW",
        "message_fr": "Heures de formation en baisse de 20% par rapport au trimestre précédent",
        "message_ar": "انخفاض ساعات التدريب بنسبة 20% مقارنة بالربع السابق",
    },
    {
        "institution_id": institutions[7].id,  # ESAC
        "kpi_domain": "infrastructure",
        "severity": "HIGH",
        "message_fr": "État des équipements classé 'mauvais' — maintenance urgente requise",
        "message_ar": "حالة المعدات مصنفة 'سيئة' — صيانة عاجلة مطلوبة",
    },
    {
        "institution_id": institutions[16].id,  # INSAT
        "kpi_domain": "academic",
        "severity": "MEDIUM",
        "message_fr": "Taux de présence en baisse à 68% — inférieur à la moyenne UCAR",
        "message_ar": "انخفاض معدل الحضور إلى 68% — أقل من متوسط جامعة قرطاج",
    },
    {
        "institution_id": institutions[15].id,  # IHEC
        "kpi_domain": "research",
        "severity": "LOW",
        "message_fr": "Nombre de publications en hausse de 35% — performance remarquable",
        "message_ar": "ارتفاع عدد المنشورات بنسبة 35% — أداء ملحوظ",
    },
]

for a in alert_data:
    db.add(Alert(id=uuid.uuid4(), triggered_at=now, **a))
print(f"  + {len(alert_data)} alerts")


# ── Commit ────────────────────────────────────────────────────────────────
db.commit()
db.close()

total = (
    len(institutions)
    + len(institutions) * 2 * 6  # academic, employment, finance, esg, hr, research
    + len(institutions) * 2      # infrastructure + partnership
    + len(alert_data)
)
print(f"\n✅ Database seeded successfully!")
print(f"   {len(institutions)} institutions")
print(f"   ~{total} total records across all tables")
