import os
import re
from typing import List, Optional
from pydantic import BaseModel, Field
from ..config import settings

class ComplaintUnderstandingOutput(BaseModel):
    issue_type: str = Field(
        ...,
        description="One of: pothole, garbage_overflow, water_leak, street_light_defect, open_manhole, fallen_tree, drainage_overflow, road_hazard, other"
    )
    detected_risks: List[str] = Field(
        default_factory=list,
        description="List of detected risks, e.g. traffic_safety, public_health, contamination, electrical_hazard, pedestrian_hazard, flooding"
    )
    urgency_hint: str = Field(
        default="medium",
        description="Urgency hint: low, medium, or high"
    )
    clean_title: str = Field(
        ...,
        description="A concise, formal summary title for the incident report (e.g. 'Severe Pothole on Sector 14 Main Road')"
    )

def _heuristic_fallback(text: str) -> ComplaintUnderstandingOutput:
    t = text.lower()
    
    # Issue Type Detection
    if any(k in t for k in ["manhole", "drain cover", "gutter open", "sewer cover", "uncovered hole"]):
        issue_type = "open_manhole"
        risks = ["pedestrian_hazard", "traffic_safety"]
        urgency = "high"
        title = "Hazardous Open Manhole / Missing Drain Cover"
    elif any(k in t for k in ["pothole", "crater", "broken road", "asphalt cracked", "road ditch", "bump"]):
        issue_type = "pothole"
        risks = ["traffic_safety"]
        urgency = "medium" if "deep" not in t and "accident" not in t else "high"
        title = "Severe Pothole & Road Surface Damage"
    elif any(k in t for k in ["garbage", "trash", "waste", "dump", "stench", "rotting", "litter", "debris"]):
        issue_type = "garbage_overflow"
        risks = ["public_health", "contamination"]
        urgency = "high" if "blocking" in t or "huge" in t or "hospital" in t else "medium"
        title = "Municipal Garbage Overflow & Sanitation Hazard"
    elif any(k in t for k in ["water leak", "pipeline burst", "pipe break", "water gushing", "flooding drinking water"]):
        issue_type = "water_leak"
        risks = ["resource_wastage", "flooding", "traffic_safety"]
        urgency = "high" if "burst" in t or "gushing" in t else "medium"
        title = "Drinking Water Pipeline Burst & Leakage"
    elif any(k in t for k in ["street light", "streetlight", "dark road", "lamp post", "hanging wire", "sparking", "blackout"]):
        issue_type = "street_light_defect"
        risks = ["electrical_hazard" if ("wire" in t or "spark" in t) else "public_safety"]
        urgency = "high" if "wire" in t or "spark" in t else "low"
        title = "Malfunctioning Street Light / Power Hazard"
    elif any(k in t for k in ["tree", "branch fell", "uprooted"]):
        issue_type = "fallen_tree"
        risks = ["traffic_safety", "obstruction"]
        urgency = "medium"
        title = "Fallen Tree Obstructing Civic Thoroughfare"
    elif any(k in t for k in ["drain", "sewage", "gutter", "clogged", "stagnant"]):
        issue_type = "drainage_overflow"
        risks = ["public_health", "flooding", "contamination"]
        urgency = "high" if "sewage" in t else "medium"
        title = "Clogged Drain & Stormwater Sewage Overflow"
    else:
        issue_type = "road_hazard"
        risks = ["civic_obstruction"]
        urgency = "medium"
        title = f"Civic Issue: {text[:40]}..."

    # Extra risk heuristics
    if any(k in t for k in ["accident", "near miss", "bike slipped", "collision", "danger to cars", "fatal"]):
        if "traffic_safety" not in risks:
            risks.append("traffic_safety")
        urgency = "high"
    if any(k in t for k in ["hospital", "school", "children", "elderly", "ambulance"]):
        if "vulnerable_population_impact" not in risks:
            risks.append("vulnerable_population_impact")
        urgency = "high"
    if any(k in t for k in ["wire", "electric", "current", "shock"]):
        if "electrical_hazard" not in risks:
            risks.append("electrical_hazard")
        urgency = "high"

    return ComplaintUnderstandingOutput(
        issue_type=issue_type,
        detected_risks=risks,
        urgency_hint=urgency,
        clean_title=title
    )

async def run_understanding_agent(text: str) -> ComplaintUnderstandingOutput:
    """
    Agent 1: Complaint Understanding Agent
    Analyzes unstructured citizen complaint text using LangChain structured outputs
    (supporting OpenAI, Groq, or Anthropic), with graceful fallback to semantic rules.
    """
    # Check if any LLM API key is available
    has_groq = bool(settings.GROQ_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)
    has_anthropic = bool(settings.ANTHROPIC_API_KEY)

    if has_groq or has_openai or has_anthropic:
        try:
            llm = None
            if has_groq and (settings.LLM_PROVIDER in ["groq", "auto"]):
                from langchain_groq import ChatGroq
                llm = ChatGroq(
                    model="llama-3.3-70b-versatile",
                    api_key=settings.GROQ_API_KEY,
                    temperature=0.1
                )
            elif has_openai and (settings.LLM_PROVIDER in ["openai", "auto"]):
                from langchain_openai import ChatOpenAI
                llm = ChatOpenAI(
                    model="gpt-4o-mini",
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.1
                )
            elif has_anthropic and (settings.LLM_PROVIDER in ["anthropic", "auto"]):
                from langchain_anthropic import ChatAnthropic
                llm = ChatAnthropic(
                    model="claude-3-haiku-20240307",
                    api_key=settings.ANTHROPIC_API_KEY,
                    temperature=0.1
                )

            if llm:
                structured_llm = llm.with_structured_output(ComplaintUnderstandingOutput)
                prompt = (
                    "You are the Complaint Understanding Agent in a Smart City Civic Grievance System.\n"
                    "Analyze this citizen grievance text and output structured metadata:\n"
                    f"Citizen Text: \"{text}\"\n"
                    "Extract the issue_type, detected_risks, urgency_hint (low, medium, high), and a concise formal clean_title."
                )
                result = await structured_llm.ainvoke(prompt)
                if isinstance(result, ComplaintUnderstandingOutput):
                    return result
        except Exception as e:
            # Fall back safely
            pass

    return _heuristic_fallback(text)
