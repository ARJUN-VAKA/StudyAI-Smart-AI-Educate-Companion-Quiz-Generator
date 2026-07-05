from firebase_admin import firestore

def get_material_data(material_id):
    """
    Fetches the material document from Firestore to get its URL and type.
    """
    db = firestore.client()
    doc_ref = db.collection('materials').document(material_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise ValueError(f"Material with ID {material_id} not found")
        
    return doc.to_dict()
