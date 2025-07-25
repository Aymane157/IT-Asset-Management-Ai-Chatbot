from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import urllib
from dotenv import load_dotenv
import os
import re
from datetime import datetime

# Load .env variables
load_dotenv()

# Initialize app
app = FastAPI(title="IT Equipment Management API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
username = os.getenv("MONGODB_USERNAME", "ronidas")
password = os.getenv("MONGODB_PASSWORD", "YFR85HiZLgqFtbPW")
cluster = os.getenv("MONGODB_CLUSTER", "cluster0.lymvb.mongodb.net")
database_name = os.getenv("MONGODB_DATABASE", "test")

connection_string = f"mongodb+srv://{urllib.parse.quote(username)}:{urllib.parse.quote(password)}@{cluster}/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(connection_string)
db = client[database_name]

# Collections
demandes_collection = db["demandes"]
materiels_collection = db["materiels"]
users_collection = db["users"]

# Input schema for /api/query
class QueryRequest(BaseModel):
    question: str

@app.get("/api/stats")
async def get_stats():
    """Returns dashboard statistics."""
    try:
        stats = {
            "materiels": {
                "total": materiels_collection.count_documents({}),
                "operationnels": materiels_collection.count_documents({"operationnel": True}),
                "en_reparation": materiels_collection.count_documents({"enReparation": True}),
                "reformes": materiels_collection.count_documents({"reforme": True}),
            },
            "users": {
                "total": users_collection.count_documents({}),
            },
            "demandes": {
                "total": demandes_collection.count_documents({}),
                "acceptees": demandes_collection.count_documents({"status": "Acceptée"}),
            }
        }
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def execute_query(payload: QueryRequest):
    question = payload.question.lower()

    try:
        # === Combien d'équipements ?
        if "combien" in question and "équipements" in question:
            count = materiels_collection.count_documents({})
            return {
                "success": True,
                "data": {
                    "answer": f"Il y a {count} équipements au total dans le système.",
                }
            }

        # === Équipements affectés à une personne
        elif "affectés" in question:
            match = re.search(r"affectés?\s+(?:à|pour)?\s*(\w+)", question)
            if match:
                person_name = match.group(1)
                items = list(materiels_collection.find(
                    {"personneAffectation": {"$regex": person_name, "$options": "i"}},
                    {"_id": 0, "designation": 1, "description": 1, "personneAffectation": 1}
                ))
                return {
                    "success": True,
                    "data": {
                        "answer": f"Équipements affectés à {person_name} :",
                        "details": items
                    }
                }
            else:
                return {
                    "success": True,
                    "data": {
                        "answer": "Je n’ai pas pu identifier le nom de la personne dans votre question.",
                        "details": []
                    }
                }

        # === Équipements obsolètes
        elif "obsolètes" in question or "fin de vie" in question:
            items = list(materiels_collection.find(
                {"obsolète": True},
                {"_id": 0, "designation": 1, "description": 1}
            ))
            return {
                "success": True,
                "data": {
                    "answer": "Voici les équipements obsolètes ou en fin de vie :",
                    "details": items
                }
            }

        # === Rapport par type
        elif "rapport" in question and "type" in question:
            pipeline = [
                {"$group": {"_id": "$type", "count": {"$sum": 1}}},
                {"$project": {"type": "$_id", "count": 1, "_id": 0}}
            ]
            report = list(materiels_collection.aggregate(pipeline))
            return {
                "success": True,
                "data": {
                    "answer": "Voici un rapport des équipements par type :",
                    "details": report
                }
            }

        # === Taux d'utilisation
        elif "taux" in question and "utilisation" in question:
            total = materiels_collection.count_documents({})
            affectes = materiels_collection.count_documents({"personneAffectation": {"$ne": None}})
            pourcentage = round((affectes / total) * 100, 2) if total else 0
            return {
                "success": True,
                "data": {
                    "answer": f"Le taux d'utilisation des équipements est de {pourcentage}%.",
                }
            }

        # === Nombre d'utilisateurs
        elif "combien" in question and "utilisateurs" in question:
            count = users_collection.count_documents({})
            return {
                "success": True,
                "data": {
                    "answer": f"Il y a actuellement {count} utilisateurs enregistrés.",
                }
            }

        # === Demandes acceptées
        elif "demandes" in question and "acceptées" in question:
            demandes = list(demandes_collection.find(
                {"status": "Acceptée"},
                {"_id": 0, "titre": 1, "description": 1, "demandeur": 1}
            ))
            return {
                "success": True,
                "data": {
                    "answer": f"{len(demandes)} demandes ont été acceptées.",
                    "details": demandes
                }
            }

        # === Équipements disponibles en stock
        elif "disponibles" in question and "stock" in question:
            disponibles = materiels_collection.count_documents({"disponibilite": True})
            return {
                "success": True,
                "data": {
                    "answer": f"Il y a {disponibles} équipements disponibles en stock."
                }
            }

        # === État des équipements
        elif "état" in question and "équipements" in question:
            total = materiels_collection.count_documents({})
            reformes = materiels_collection.count_documents({"reforme": True})
            en_reparation = materiels_collection.count_documents({"enReparation": True})
            operationnels = materiels_collection.count_documents({"operationnel": True})

            return {
                "success": True,
                "data": {
                    "answer": (
                        f"Voici l'état des équipements informatiques :\n"
                        f"- {operationnels} opérationnel(s)\n"
                        f"- {en_reparation} en réparation\n"
                        f"- {reformes} réformé(s)\n"
                        f"- {total} au total"
                    )
                }
            }

        # === Date d'affectation d'un équipement
        elif ("quand" in question or "date" in question) and ("affecté" in question or "affectation" in question):
            mots_cles = question.split()
            regex = "|".join([re.escape(mot) for mot in mots_cles])

            item = materiels_collection.find_one(
                {
                    "designation": {"$regex": regex, "$options": "i"},
                    "personneAffectation": {"$exists": True, "$ne": None},
                    "createdAt": {"$exists": True}
                },
                {"_id": 0, "designation": 1, "personneAffectation": 1, "createdAt": 1}
            )

            if item:
                created_at = item.get("createdAt")
                if isinstance(created_at, datetime):
                    created_at = created_at.strftime("%d/%m/%Y")

                return {
                    "success": True,
                    "data": {
                        "answer": f"{item['designation']} a été affecté à {item.get('personneAffectation', 'utilisateur inconnu')} le {created_at or 'date inconnue'}."
                    }
                }
            else:
                return {
                    "success": True,
                    "data": {
                        "answer": "Aucun équipement correspondant avec une date d'affectation trouvée."
                    }
                }

        # === Default fallback
        else:
            return {
                "success": True,
                "data": {
                    "answer": "Je n'ai pas compris votre question. Pouvez-vous la reformuler ?",
                }
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")
