import re
import spacy

# Load spaCy model (could be imported from skill_extractor or loaded again)
nlp = spacy.load("en_core_web_sm")

# Regular expressions for cleaning title noise
NOISE_PATTERNS = [
    # Remove parentheses with seniority/location/type info
    re.compile(r"\((?:senior|junior|lead|principal|intern|associate|sr\.?|jr\.?|remote|hybrid|full[- ]time|part[- ]time)\)", re.IGNORECASE),
    # Remove trailing hyphens or pipes with locations/employment type
    re.compile(r"\s*[-|]\s*(?:colombo|sri\s*lanka|lanka|remote|hybrid|full[- ]time|part[- ]time|contract|permanent|temporary)\b.*$", re.IGNORECASE),
    # Strip standalone seniority words
    re.compile(r"\b(?:senior|junior|lead|principal|intern|associate|sr\.?|jr\.?)\b", re.IGNORECASE),
]

ROLE_KEYWORDS = ["engineer", "developer", "analyst", "manager", "specialist", "administrator", "admin", "architect", "officer", "consultant", "designer", "programmer"]

def clean_title(title: str) -> str:
    if not title:
        return ""
    cleaned = title
    for pattern in NOISE_PATTERNS:
        cleaned = pattern.sub("", cleaned)
    # Collapse extra spaces
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()

def extract_job_role(title: str, cleaned_text: str) -> str | None:
    cleaned_title = clean_title(title)
    
    # If title is usable, return it title-cased
    if cleaned_title and len(cleaned_title) > 2:
        return cleaned_title.title()

    # Fallback to spaCy noun chunks from first 1-2 sentences of cleaned_text
    if not cleaned_text:
        return None

    doc = nlp(cleaned_text)
    sentences = list(doc.sents)[:2]
    
    # Re-parse the text of the first 2 sentences to get noun chunks specifically within them
    sent_text = " ".join([sent.text for sent in sentences])
    sent_doc = nlp(sent_text)
    
    # Search for a noun chunk containing job role keywords first
    for chunk in sent_doc.noun_chunks:
        chunk_text = chunk.text.strip().lower()
        if any(kw in chunk_text for kw in ROLE_KEYWORDS) and len(chunk_text) < 50:
            cleaned_chunk = re.sub(r"^(?:a|an|the)\s+", "", chunk.text.strip(), flags=re.IGNORECASE)
            return cleaned_chunk.title()
            
    # Fallback to the first noun chunk under 40 characters
    for chunk in sent_doc.noun_chunks:
        chunk_text = chunk.text.strip()
        if 3 < len(chunk_text) < 40:
            cleaned_chunk = re.sub(r"^(?:a|an|the)\s+", "", chunk_text, flags=re.IGNORECASE)
            return cleaned_chunk.title()

    return None
