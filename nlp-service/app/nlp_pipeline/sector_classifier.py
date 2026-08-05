import os
import json
import re

# Load sector keywords mapping
KEYWORDS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "sector_keywords.json"
)

with open(KEYWORDS_PATH, "r", encoding="utf-8") as f:
    sector_keywords = json.load(f)

# Precompile regex for each sector's keywords to ensure accurate word boundary matches
sector_regexes = {}
for sector, keywords in sector_keywords.items():
    patterns = []
    for kw in keywords:
        # If it's a word, use word boundaries. If it contains non-word characters, just escape it.
        escaped = re.escape(kw)
        if re.match(r"^\w+$", kw):
            patterns.append(rf"\b{escaped}\b")
        else:
            patterns.append(escaped)
    
    # Combine into a single regex for the sector
    sector_regexes[sector] = re.compile("|".join(patterns), re.IGNORECASE)

def classify_sector(company: str, cleaned_text: str) -> str | None:
    text_to_search = f"{company or ''} {cleaned_text or ''}"
    
    best_sector = None
    max_matches = 0
    
    for sector, regex in sector_regexes.items():
        matches = len(regex.findall(text_to_search))
        if matches > max_matches:
            max_matches = matches
            best_sector = sector
            
    if max_matches == 0:
        return "Unclassified"
        
    return best_sector
