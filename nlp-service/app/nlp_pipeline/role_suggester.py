import spacy

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback to loading it in another way or raising
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

ROLE_PROFILES = {
    "Software Developer": {"software", "developer", "engineer", "programming", "coding", "application", "algorithm", "data structure", "git"},
    "Backend Developer": {"backend", "server", "api", "database", "sql", "node", "express", "java", "springboot", "rest", "python", "django"},
    "Frontend Developer": {"frontend", "client", "browser", "react", "javascript", "css", "html", "figma", "tailwind", "styling", "ui", "ux"},
    "Full Stack Developer": {"fullstack", "full", "stack", "react", "node", "express", "web", "database", "api", "frontend", "backend"},
    "Data Analyst": {"data", "analyst", "analytics", "excel", "sql", "python", "pandas", "powerbi", "tableau", "reporting", "charts"},
    "ML / AI Engineer": {"ml", "ai", "machine", "learning", "artificial", "intelligence", "python", "tensorflow", "pytorch", "model", "neural", "pandas", "numpy"},
    "DevOps / Cloud": {"devops", "cloud", "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "pipeline", "deployment", "linux", "scripting"},
    "QA Engineer": {"qa", "testing", "quality", "assurance", "manual", "automation", "selenium", "test", "case", "bug", "debugging"},
    "UI/UX Designer": {"design", "designer", "figma", "wireframe", "prototype", "ux", "ui", "user", "experience", "research", "usability", "visual"},
    "Business Analyst": {"business", "analyst", "requirements", "agile", "scrum", "process", "workflow", "product", "documentation", "management"},
    "Marketing Executive": {"marketing", "sales", "campaign", "communication", "executive", "market", "research", "content", "media"},
    "Digital Marketing": {"digital", "marketing", "seo", "ad", "sem", "analytics", "google", "social", "media", "campaign", "growth"},
    "Product Manager": {"product", "manager", "strategy", "roadmap", "agile", "scrum", "lifecycle", "market", "management", "user", "research"},
    "HR / People Ops": {"hr", "human", "resources", "people", "ops", "hiring", "recruitment", "talent", "onboarding", "training", "culture", "employee"},
    "Content Writer": {"writer", "content", "writing", "copywriter", "copy", "blogging", "article", "seo", "editing"},
    "UX Writer": {"writer", "ux", "writing", "copy", "microcopy", "content", "figma", "product", "design", "communication", "guide"},
    "Journalist / Editor": {"journalist", "editor", "writing", "editing", "article", "news", "reporting", "interview", "copyedit"},
    "Research / Policy": {"research", "policy", "academia", "scientific", "analysis", "report", "methodology", "academic", "paper"}
}

def suggest_roles(user_text: str) -> list:
    if not user_text or not user_text.strip():
        return []

    doc = nlp(user_text.lower())
    user_words = set()
    for token in doc:
        if not token.is_stop and not token.is_punct:
            lemma = token.lemma_.strip()
            text = token.text.strip()
            if lemma:
                user_words.add(lemma)
            if text:
                user_words.add(text)

    suggestions = []
    for role, keywords in ROLE_PROFILES.items():
        matched = user_words.intersection(keywords)
        if matched:
            suggestions.append({
                "role": role,
                "score": len(matched),
                "matched_keywords": list(matched)
            })

    # Sort by score descending, then by role name to be deterministic
    suggestions.sort(key=lambda x: (-x["score"], x["role"]))
    return suggestions[:3]
