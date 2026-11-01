from typing import Dict

DEPARTMENT_ROUTING_MAP: Dict[str, str] = {
    "garbage_overflow": "Municipal Sanitation Unit",
    "waste": "Municipal Sanitation Unit",
    "litter": "Municipal Sanitation Unit",
    "pothole": "Public Works Department (PWD)",
    "road_hazard": "Public Works Department (PWD)",
    "asphalt": "Public Works Department (PWD)",
    "water_leak": "Water Supply & Sewerage Board",
    "drainage_overflow": "Water Supply & Sewerage Board",
    "street_light_defect": "Power Utility Board",
    "electrical": "Power Utility Board",
    "open_manhole": "Public Works Department (PWD)",
    "fallen_tree": "Horticulture & Parks Wing",
    "parks": "Horticulture & Parks Wing",
}

def route_department(issue_type: str, detected_risks: list = None) -> str:
    """
    Agent 5: Department Routing Agent
    Determines the municipal authority accountable for resolving the incident.
    """
    detected_risks = detected_risks or []
    
    # Check for direct electrical emergency risk
    if "electrical_hazard" in detected_risks:
        return "Power Utility Board"
        
    return DEPARTMENT_ROUTING_MAP.get(issue_type.lower(), "General Civic Response")
