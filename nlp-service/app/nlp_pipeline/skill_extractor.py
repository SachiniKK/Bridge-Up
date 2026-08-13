import os
import json
import spacy
from spacy.matcher import PhraseMatcher

# Load spacy model
nlp = spacy.load("en_core_web_sm")

# Load taxonomy
TAXONOMY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "skills_taxonomy.json"
)

with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
    taxonomy = json.load(f)

# Build PhraseMatcher and lookup dict
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
taxonomy_lookup = {}  # lowercase -> (skill_name, type)

for entry in taxonomy:
    skill_name = entry["skill"]
    aliases = entry.get("aliases", [])
    
    # Add main skill to lookup
    taxonomy_lookup[skill_name.lower().strip()] = (skill_name, "main")
    matcher.add(skill_name, [nlp.make_doc(skill_name)])
    
    # Add aliases to lookup
    for alias in aliases:
        taxonomy_lookup[alias.lower().strip()] = (skill_name, "alias")
        matcher.add(skill_name, [nlp.make_doc(alias)])

def extract_skills(cleaned_text: str) -> list[dict]:
    if not cleaned_text:
        return []

    doc = nlp(cleaned_text)
    matches = matcher(doc)

    # Accumulate match counts and check which type of match occurred
    skill_stats = {}  # skill_name -> { "match_count": int, "is_main_matched": bool }
    
    for match_id, start, end in matches:
        skill_name = nlp.vocab.strings[match_id]
        span = doc[start:end]
        matched_text = span.text.lower().strip()
        
        info = taxonomy_lookup.get(matched_text)
        is_main = True
        if info:
            _, match_type = info
            is_main = (match_type == "main")
            
        if skill_name not in skill_stats:
            skill_stats[skill_name] = {
                "match_count": 0,
                "is_main_matched": False
            }
        
        skill_stats[skill_name]["match_count"] += 1
        if is_main:
            skill_stats[skill_name]["is_main_matched"] = True

    results = []
    for skill_name, stats in skill_stats.items():
        # Compute confidence score
        # 1.0 if exact skill name matched, 0.85 if only alias matched
        base_confidence = 1.0 if stats["is_main_matched"] else 0.85
        
        # Boost confidence by 0.05 per extra match, capped at 1.0
        extra_matches = stats["match_count"] - 1
        confidence = min(1.0, base_confidence + extra_matches * 0.05)
        
        if confidence >= 0.80:
            results.append({
                "skill": skill_name,
                "confidence": round(confidence, 2),
                "match_count": stats["match_count"]
            })

    return results
