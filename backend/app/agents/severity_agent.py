from typing import List, Tuple

BASE_DANGER_SCORES = {
    "open_manhole": 65.0,
    "drainage_overflow": 50.0,
    "fallen_tree": 48.0,
    "pothole": 42.0,
    "water_leak": 38.0,
    "garbage_overflow": 32.0,
    "street_light_defect": 28.0,
    "road_hazard": 40.0,
    "other": 25.0
}

RISK_WEIGHTS = {
    "electrical_hazard": 25.0,
    "vulnerable_population_impact": 20.0,
    "pedestrian_hazard": 16.0,
    "traffic_safety": 15.0,
    "public_health": 15.0,
    "flooding": 14.0,
    "contamination": 12.0,
    "civic_obstruction": 10.0,
    "resource_wastage": 8.0,
    "public_safety": 8.0
}

URGENCY_BONUS = {
    "high": 15.0,
    "medium": 5.0,
    "low": 0.0
}

def calculate_priority_severity(
    issue_type: str,
    detected_risks: List[str],
    urgency_hint: str = "medium",
    reported_by_count: int = 1
) -> Tuple[float, str]:
    """
    Agent 4: Priority & Severity Agent
    Computes a composite danger score (0-100) and maps to
    LOW, MEDIUM, HIGH, or CRITICAL.
    """
    base = BASE_DANGER_SCORES.get(issue_type.lower(), 30.0)
    
    # Risk bonuses
    risk_bonus = 0.0
    for r in detected_risks:
        risk_bonus += RISK_WEIGHTS.get(r.lower(), 10.0)
    
    # Cap total risk bonus to avoid overshoot
    risk_bonus = min(35.0, risk_bonus)
    
    # Urgency hint
    urgency_val = URGENCY_BONUS.get(urgency_hint.lower(), 5.0)
    
    # Repeated citizen reporting multiplier
    crowd_multiplier = max(0, reported_by_count - 1) * 8.0
    
    total_score = base + risk_bonus + urgency_val + crowd_multiplier
    clamped_score = max(5.0, min(100.0, total_score))
    
    if clamped_score >= 81.0:
        level = "CRITICAL"
    elif clamped_score >= 61.0:
        level = "HIGH"
    elif clamped_score >= 36.0:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    return round(clamped_score, 1), level
