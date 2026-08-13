import re

RANGE_PATTERN = re.compile(r"\b(\d+)\s*(?:to|[-])\s*(\d+)\s*years?\s*(?:of\s*)?experience", re.IGNORECASE)
YEARS_EXP_PATTERN = re.compile(r"\b(\d+)\+?\s*years?\s*(?:of\s*)?experience", re.IGNORECASE)
MIN_YEARS_PATTERN = re.compile(r"minimum\s*(\d+)\s*years?", re.IGNORECASE)
QUALITATIVE_ENTRY_PATTERN = re.compile(r"\b(entry[- ]level|fresh\s+graduate|no\s+experience\s+required|no\s+prior\s+experience)\b", re.IGNORECASE)

def extract_experience(cleaned_text: str) -> dict:
    result = {
        "min_years": None,
        "max_years": None,
        "level": None
    }
    
    if not cleaned_text:
        return result

    # Check for range: "2 to 4 years of experience", "3 - 5 years experience"
    range_match = RANGE_PATTERN.search(cleaned_text)
    if range_match:
        try:
            result["min_years"] = int(range_match.group(1))
            result["max_years"] = int(range_match.group(2))
        except ValueError:
            pass
            
    # Check for "X+ years of experience" or "X years experience"
    if result["min_years"] is None:
        years_match = YEARS_EXP_PATTERN.search(cleaned_text)
        if years_match:
            try:
                result["min_years"] = int(years_match.group(1))
            except ValueError:
                pass
                
    # Check for "minimum X years"
    if result["min_years"] is None:
        min_match = MIN_YEARS_PATTERN.search(cleaned_text)
        if min_match:
            try:
                result["min_years"] = int(min_match.group(1))
            except ValueError:
                pass

    # If we found years of experience, infer the level
    if result["min_years"] is not None:
        min_yrs = result["min_years"]
        if min_yrs <= 1:
            result["level"] = "entry"
        elif min_yrs <= 4:
            result["level"] = "mid"
        else:
            result["level"] = "senior"
        return result

    # If no numbers found, check for qualitative entry level phrases
    if QUALITATIVE_ENTRY_PATTERN.search(cleaned_text):
        result["min_years"] = 0
        result["level"] = "entry"

    return result
