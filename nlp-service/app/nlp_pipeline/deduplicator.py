from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from app.models.job_posting import JobPosting

def find_near_duplicates(db: Session) -> list[tuple[int, int]]:
    # Retrieve all job postings sorted by ID
    postings = db.query(JobPosting).order_by(JobPosting.id).all()
    
    if len(postings) < 2:
        return []
        
    # Get cleaned text, fallback to raw text if cleaned text is not populated yet
    texts = [p.cleaned_text or p.raw_text or "" for p in postings]
    
    # Ensure there is at least some content to vectorize
    if not any(t.strip() for t in texts):
        return []
        
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        sim_matrix = cosine_similarity(tfidf_matrix)
    except Exception:
        # Fallback in case of vectorization errors on empty/invalid inputs
        return []
    
    pairs = []
    n = len(postings)
    for i in range(n):
        for j in range(i + 1, n):
            score = sim_matrix[i, j]
            if score >= 0.90:
                pairs.append((postings[i].id, postings[j].id))
                
    return pairs

def mark_duplicates(pairs: list[tuple[int, int]], db: Session) -> int:
    if not pairs:
        return 0
        
    # Collect all unique IDs involved in the pairs
    ids = set()
    for a, b in pairs:
        ids.add(a)
        ids.add(b)
        
    # Query postings and store in a map
    postings_map = {p.id: p for p in db.query(JobPosting).filter(JobPosting.id.in_(ids)).all()}
    
    marked_count = 0
    
    for id_a, id_b in pairs:
        p_a = postings_map.get(id_a)
        p_b = postings_map.get(id_b)
        
        if not p_a or not p_b:
            continue
            
        # Determine the newer posting (canonical is the older one)
        if p_a.fetched_at and p_b.fetched_at:
            if p_a.fetched_at > p_b.fetched_at:
                newer = p_a
            elif p_a.fetched_at < p_b.fetched_at:
                newer = p_b
            else:
                newer = p_a if p_a.id > p_b.id else p_b
        else:
            newer = p_a if p_a.id > p_b.id else p_b
            
        if not newer.is_duplicate:
            newer.is_duplicate = True
            marked_count += 1
            
    if marked_count > 0:
        db.commit()
        
    return marked_count
