import re
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

# Boilerplate patterns to remove
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\+?\d{9,12}\b")
BOILERPLATE_PHRASES = [
    r"apply\s+now",
    r"send\s+(?:your\s+)?cv\s+to",
    r"submit\s+(?:your\s+)?cv",
    r"apply\s+here",
    r"send\s+(?:your\s+)?resume\s+to",
    r"submit\s+(?:your\s+)?resume",
    r"career\s+opportunities",
    r"click\s+here\s+to\s+apply"
]
BOILERPLATE_REGEX = re.compile(r"|".join(BOILERPLATE_PHRASES), re.IGNORECASE)

def clean_text(raw_text: str) -> str:
    if not raw_text:
        return ""

    # Remove HTML tags/entities using BeautifulSoup
    if BeautifulSoup:
        try:
            soup = BeautifulSoup(raw_text, "html.parser")
            text = soup.get_text(separator=" ")
        except Exception:
            text = re.sub(r"<[^>]+>", " ", raw_text)
    else:
        text = re.sub(r"<[^>]+>", " ", raw_text)

    # Strip boilerplate phrases
    text = BOILERPLATE_REGEX.sub(" ", text)

    # Strip email addresses and phone numbers
    text = EMAIL_REGEX.sub(" ", text)
    text = PHONE_REGEX.sub(" ", text)

    # Normalize whitespace (collapse multiple spaces/newlines into one space)
    text = re.sub(r"\s+", " ", text)

    return text.strip()
