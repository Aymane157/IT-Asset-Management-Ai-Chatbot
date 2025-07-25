import streamlit as st
from pymongo import MongoClient
import urllib, json, os
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go


# Alternative AI provider imports
# Option 1: Anthropic Claude
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

# Option 2: Google Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Option 3: Hugging Face Transformers (Local/Free)
try:
    from transformers import pipeline
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    HUGGINGFACE_AVAILABLE = False

# Option 4: Ollama (Local/Free)
try:
    import requests
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Assistant IT - Gestion d'Équipements", 
    page_icon="🖥️",
    layout="wide"
)

st.title("🖥️ Assistant IT - Gestion d'Équipements")
st.write("Posez vos questions sur la gestion des équipements informatiques en français")

class AIProvider:
    """Base class for AI providers"""
    def __init__(self):
        self.name = "Base"
    
    def generate_query(self, question, prompt_template):
        raise NotImplementedError

class AnthropicProvider(AIProvider):
    """Anthropic Claude provider"""
    def __init__(self):
        self.name = "Anthropic Claude"
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def generate_query(self, question, prompt_template):
        prompt = prompt_template.format(question=question)
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

class GeminiProvider(AIProvider):
    """Google Gemini provider"""
    def __init__(self):
        self.name = "Google Gemini"
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-pro')
    
    def generate_query(self, question, prompt_template):
        prompt = prompt_template.format(question=question)
        response = self.model.generate_content(prompt)
        return response.text

class HuggingFaceProvider(AIProvider):
    """Hugging Face local model provider (Free)"""
    def __init__(self):
        self.name = "Hugging Face (Local)"
        # Using a smaller model that can run locally
        self.generator = pipeline(
            "text-generation",
            model="microsoft/DialoGPT-medium",
            max_length=512,
            temperature=0.1
        )
    
    def generate_query(self, question, prompt_template):
        prompt = prompt_template.format(question=question)
        # Simplified prompt for smaller models
        simple_prompt = f"Convert this French question to MongoDB query: {question}"
        response = self.generator(simple_prompt, max_new_tokens=200)
        return response[0]['generated_text']

class OllamaProvider(AIProvider):
    """Ollama local provider (Free)"""
    def __init__(self):
        self.name = "Ollama (Local)"
        self.base_url = "http://localhost:11434"
        # Check if Ollama is running
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code != 200:
                raise ValueError("Ollama server not running")
        except requests.exceptions.RequestException:
            raise ValueError("Ollama server not accessible")
    
    def generate_query(self, question, prompt_template):
        prompt = prompt_template.format(question=question)
        payload = {
            "model": "llama2",  # or "codellama", "mistral", etc.
            "prompt": prompt,
            "stream": False
        }
        response = requests.post(f"{self.base_url}/api/generate", json=payload)
        if response.status_code == 200:
            return response.json()["response"]
        else:
            raise Exception(f"Ollama API error: {response.status_code}")

def setup_ai_provider():
    """Setup AI provider based on availability and user choice"""
    st.sidebar.header("🤖 Choix du Fournisseur IA")
    
    # Available providers
    providers = {}
    
    if ANTHROPIC_AVAILABLE and os.getenv("ANTHROPIC_API_KEY"):
        providers["Anthropic Claude"] = AnthropicProvider
    
    if GEMINI_AVAILABLE and os.getenv("GOOGLE_API_KEY"):
        providers["Google Gemini"] = GeminiProvider
    
    if HUGGINGFACE_AVAILABLE:
        providers["Hugging Face (Gratuit)"] = HuggingFaceProvider
    
    if OLLAMA_AVAILABLE:
        try:
            # Test Ollama connection
            requests.get("http://localhost:11434/api/tags", timeout=2)
            providers["Ollama (Local)"] = OllamaProvider
        except:
            pass
    
    if not providers:
        st.error("❌ Aucun fournisseur IA disponible!")
        st.markdown("""
        **Options disponibles :**
        
        1. **Anthropic Claude** (Payant, excellent)
           - Installation: `pip install anthropic`
           - Clé API: `ANTHROPIC_API_KEY=your-key`
        
        2. **Google Gemini** (Gratuit avec limites)
           - Installation: `pip install google-generativeai`
           - Clé API: `GOOGLE_API_KEY=your-key`
        
        3. **Hugging Face** (Gratuit, local)
           - Installation: `pip install transformers torch`
           - Aucune clé API requise
        
        4. **Ollama** (Gratuit, local)
           - Installation: Télécharger depuis ollama.ai
           - Lancer: `ollama run llama2`
        """)
        return None
    
    # Provider selection
    selected = st.sidebar.selectbox("Choisir le fournisseur :", list(providers.keys()))
    
    try:
        provider = providers[selected]()
        st.sidebar.success(f"✅ {provider.name} configuré")
        return provider
    except Exception as e:
        st.sidebar.error(f"❌ Erreur {selected}: {e}")
        return None

# Configuration function
def setup_configuration():
    """Configure the application with error handling"""
    
    st.sidebar.header("🔧 Configuration Base de Données")
    
    # MongoDB Configuration
    with st.sidebar.expander("Paramètres MongoDB", expanded=True):
        username = os.getenv("MONGODB_USERNAME", "ronidas")
        password = os.getenv("MONGODB_PASSWORD", "YFR85HiZLgqFtbPW")
        cluster = os.getenv("MONGODB_CLUSTER", "cluster0.lymvb.mongodb.net")
        database_name = st.text_input("Nom de la base de données", value="test")
    
    try:
        # MongoDB connection
        connection_string = f"mongodb+srv://{urllib.parse.quote(username)}:{urllib.parse.quote(password)}@{cluster}/?retryWrites=true&w=majority&appName=Cluster0"
        client = MongoClient(connection_string)
        
        # Test connection
        client.admin.command('ping')
        st.sidebar.success("✅ MongoDB Connecté")
        
        # Get database and collections
        db = client[database_name]
        demandes_collection = db["demandes"]
        materiels_collection = db["materiels"]
        users_collection = db["users"]
        
        # Display collection stats
        demandes_count = demandes_collection.count_documents({})
        materiels_count = materiels_collection.count_documents({})
        users_count = users_collection.count_documents({})
        
        st.sidebar.info(f"""
        📊 **Collections :**
        - Demandes: {demandes_count}
        - Matériels: {materiels_count}  
        - Utilisateurs: {users_count}
        """)
        
        return db, demandes_collection, materiels_collection, users_collection
        
    except Exception as e:
        st.sidebar.error(f"❌ Erreur MongoDB: {e}")
        st.error(f"Échec de connexion à la base de données: {e}")
        return None, None, None, None

# Setup configuration
db_result = setup_configuration()
if db_result == (None, None, None, None):
    st.stop()

db, demandes_collection, materiels_collection, users_collection = db_result

# Setup AI provider
ai_provider = setup_ai_provider()
if not ai_provider:
    st.stop()

# Analyze collections structure (same as before)
@st.cache_data
def analyze_collections_structure():
    """Analyze the structure of all collections"""
    try:
        structures = {}
        
        demandes_sample = list(demandes_collection.find().limit(2))
        if demandes_sample:
            structures['demandes'] = demandes_sample[0]
        
        materiels_sample = list(materiels_collection.find().limit(2))
        if materiels_sample:
            structures['materiels'] = materiels_sample[0]
            
        users_sample = list(users_collection.find().limit(2))
        if users_sample:
            structures['users'] = users_sample[0]
            
        return structures
        
    except Exception as e:
        st.error(f"Erreur lors de l'analyse des collections: {e}")
        return {}

# Get collection structures
collection_structures = analyze_collections_structure()

# Display database structure
with st.expander("📊 Structure des Collections", expanded=False):
    for collection_name, structure in collection_structures.items():
        st.subheader(f"Collection: {collection_name}")
        st.json(structure, expanded=False)

# Predefined French questions (same as before)
st.sidebar.header("📝 Questions Prédéfinies")
french_questions = [
    "Combien d'équipements sont disponibles en stock ?",
    "Quels sont les équipements affectés à Aymane Eddamane ?",
    "Quel est l'état des équipements informatiques ?",
    "Combien de matériels sont en panne actuellement ?",
    "Quels sont les équipements obsolètes ou en fin de vie ?",
    "Peux-tu me donner un rapport sur les équipements par type ?",
    "Quand a été affecté l'écran Lenovo à l'utilisateur ?",
    "Quel est le taux d'utilisation des équipements ?",
    "Combien d'utilisateurs sont dans le système ?",
    "Quelles sont les demandes acceptées ?"
]

selected_question = st.sidebar.selectbox("Choisir une question :", [""] + french_questions)

# Main input area
user_question = st.text_area(
    "Posez votre question sur les équipements :",
    value=selected_question if selected_question else "",
    placeholder="Ex: Quels sont les équipements affectés à Aymane Eddamane ?",
    height=100
)

# Enhanced prompt template (same as before)
prompt_template = """
Tu es un expert en analyse de bases de données MongoDB spécialisé dans la gestion d'équipements informatiques.
Tu dois convertir les questions en français en requêtes d'agrégation MongoDB.

STRUCTURE DES COLLECTIONS :

1. Collection "demandes" - Gère les demandes d'équipements :
   - _id: ObjectId
   - typeStock: type d'équipement (ex: "Informatique")
   - description: description de l'équipement
   - designation: nom/type d'équipement (ex: "Poste téléphonique")
   - commentaire: commentaires
   - user: ObjectId de l'utilisateur
   - status: état de la demande ("Acceptée", "En attente", etc.)
   - createdAt: date de création

2. Collection "materiels" - Inventaire des équipements :
   - _id: ObjectId
   - sn: numéro de série (ex: "VNA2PMPP")
   - code: code d'équipement (ex: "ADD/INFO/00017")
   - dateMiseEnService: date de mise en service
   - designation: type d'équipement (ex: "Ecran")
   - description: description détaillée
   - prixHT: prix hors taxe
   - fournisseur: fournisseur (ex: "REPER")
   - facture: numéro de facture
   - operationnel: boolean (true/false)
   - enReparation: boolean (true/false)
   - reforme: boolean (true/false)
   - personneAffectation: nom de la personne affectée
   - observations: observations
   - public: boolean(true/false)
   -disponibilite: boolean(true/false)

3. Collection "users" - Utilisateurs du système :
   - _id: ObjectId
   - name: nom complet
   - email: adresse email
   - password: mot de passe hashé
   - role: rôle ("Admin", etc.)
   - department: département
   - fonction: fonction
   - material: array (équipements assignés)
   - demandes: array (demandes faites)
   - createdAt: date de création

RÈGLES IMPORTANTES :
1. Retourne UNIQUEMENT un pipeline d'agrégation MongoDB valide au format JSON
2. Utilise les bons noms de champs selon la structure ci-dessus
3. Pour compter, utilise {{"$count": "total"}}
4. Pour les jointures entre collections, utilise $lookup
5. Adapte-toi aux variations de noms (équipements = matériels, utilisateurs = users)
6. Gère les états d'équipements : operationnel, enReparation, reforme
7. Pour l'affectation, utilise le champ "personneAffectation"

EXEMPLES DE MAPPING :
- "équipements disponibles" → materiels avec disponibilite: true
- "équipements en panne" → materiels avec enReparation: true
- "équipements obsolètes" → materiels avec reforme: true
- "équipements affectés à X" → demandes avec status: "Acceptée" et personneAffectation: "X", puis retourne les champs description et designation
- "utilisateurs dans le système" → users count

Question de l'utilisateur: {question}

Pipeline MongoDB (JSON uniquement):
"""

# Utility functions (same as before)
def format_french_results(results, question):
    """Format results in French"""
    if not results:
        return "Aucun résultat trouvé."
    
    if len(results) == 1 and isinstance(results[0], dict):
        result = results[0]
        if 'total' in result:
            count = result['total']
            if 'combien' in question.lower():
                return f"**Réponse :** {count} élément(s) trouvé(s)"
            else:
                return f"**Total :** {count}"
    
    return results

def create_french_visualization(results, question):
    """Create visualizations with French labels"""
    if not results or len(results) == 0:
        return None
    
    try:
        if len(results) == 1 and 'total' in results[0]:
            fig = go.Figure(go.Indicator(
                mode = "number",
                value = results[0]['total'],
                title = {"text": "Nombre Total"},
                number = {"font": {"size": 40}}
            ))
            return fig
        
        df = pd.DataFrame(results)
        if len(df) > 1 and '_id' in df.columns:
            if len(df.columns) == 2:
                other_col = [col for col in df.columns if col != '_id'][0]
                fig = px.bar(
                    df, 
                    x='_id', 
                    y=other_col, 
                    title="Résultats de la Requête",
                    labels={'_id': 'Catégorie', other_col: 'Nombre'}
                )
                return fig
    
    except Exception as e:
        st.error(f"Erreur de visualisation: {e}")
    
    return None

# Process user question
if user_question and st.button("🔍 Analyser", type="primary"):
    
    try:
        
        with st.spinner(f"🤖 Analyse avec {ai_provider.name}..."):
            # Generate MongoDB query using selected AI provider
            response_text = ai_provider.generate_query(user_question, prompt_template)
            
            # Clean and parse the query
            query_text = response_text.strip()
            
            # Remove code block markers if present
            if query_text.startswith("```"):
                lines = query_text.split('\n')
                query_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else query_text
            
            # Extract JSON from response if it contains other text
            try:
                # Find JSON in the response
                start_idx = query_text.find('[')
                if start_idx == -1:
                    start_idx = query_text.find('{')
                end_idx = query_text.rfind(']')
                if end_idx == -1:
                    end_idx = query_text.rfind('}')
                
                if start_idx != -1 and end_idx != -1:
                    query_text = query_text[start_idx:end_idx+1]
            except:
                pass
            
            # Parse JSON query
            query = json.loads(query_text)
            
            # Determine which collection to query
            collection_to_use = materiels_collection  # Default
            
            if any(word in user_question.lower() for word in ['utilisateur', 'user', 'personne']):
                if 'demande' in user_question.lower():
                    collection_to_use = demandes_collection
                elif any(word in user_question.lower() for word in ['utilisateur', 'user']):
                    collection_to_use = users_collection
            elif 'demande' in user_question.lower():
                collection_to_use = demandes_collection
            
            # Execute the query
            results = list(collection_to_use.aggregate(query))
            
            # Display results (same as before)
            st.subheader("📊 Résultats")
            
            if results:
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    formatted_answer = format_french_results(results, user_question)
                    if isinstance(formatted_answer, str):
                        st.markdown(formatted_answer)
                    else:
                        st.write("**Résultats détaillés :**")
                        for i, result in enumerate(results[:10]):
                            with st.expander(f"Résultat {i+1}", expanded=i<3):
                                if isinstance(result, dict):
                                    formatted_result = {}
                                    for key, value in result.items():
                                        french_key = {
                                            'designation': 'Désignation',
                                            'description': 'Description', 
                                            'personneAffectation': 'Personne Affectée',
                                            'operationnel': 'Opérationnel',
                                            'enReparation': 'En Réparation',
                                            'reforme': 'Réformé',
                                            'fournisseur': 'Fournisseur',
                                            'status': 'Statut',
                                            'name': 'Nom',
                                            'email': 'Email',
                                            'department': 'Département',
                                            'disponibilite': 'Disponibilité',   
                                        }.get(key, key)
                                        formatted_result[french_key] = value
                                    st.json(formatted_result)
                                else:
                                    st.json(result)
                        
                        if len(results) > 10:
                            st.info(f"Affichage des 10 premiers résultats sur {len(results)}")
                
                with col2:
                    fig = create_french_visualization(results, user_question)
                    if fig:
                        st.plotly_chart(fig, use_container_width=True)
                
                st.success(f"✅ {len(results)} résultat(s) trouvé(s)")
                
                with st.expander("🔍 Détails Techniques"):
                    st.write("**Requête MongoDB générée :**")
                    st.code(json.dumps(query, indent=2), language="json")
                    
                    st.write("**Collection utilisée :**")
                    st.code(collection_to_use.name)
                    
                    st.write("**Fournisseur IA utilisé :**")
                    st.code(ai_provider.name)
                    
                    st.write("**Résultats bruts :**")
                    st.json(results[:5])
            
            else:
                st.warning("Aucun résultat trouvé pour votre requête.")
                with st.expander("🔍 Requête Générée"):
                    st.code(json.dumps(query, indent=2), language="json")
    
    except json.JSONDecodeError as e:
        st.error("❌ Erreur lors de l'analyse de la requête. Veuillez reformuler votre question.")
        with st.expander("Informations de débogage"):
            st.write("Texte généré:", response_text)
            st.write("Erreur JSON:", str(e))
    
    except Exception as e:
        st.error(f"❌ Erreur lors de l'exécution: {str(e)}")
        with st.expander("Informations de débogage"):
            st.write("Détails de l'erreur:", str(e))

# Quick stats in sidebar (same as before)
st.sidebar.header("📈 Statistiques Rapides")

if st.sidebar.button("📊 Stats Générales"):
    try:
        total_materiels = materiels_collection.count_documents({})
        materiels_operationnels = materiels_collection.count_documents({"operationnel": True})
        materiels_en_reparation = materiels_collection.count_documents({"enReparation": True})
        materiels_reformes = materiels_collection.count_documents({"reforme": True})
        
        total_users = users_collection.count_documents({})
        
        total_demandes = demandes_collection.count_documents({})
        demandes_acceptees = demandes_collection.count_documents({"status": "Acceptée"})
        
        st.sidebar.markdown(f"""
        **📦 Matériels:**
        - Total: {total_materiels}
        - Opérationnels: {materiels_operationnels}
        - En réparation: {materiels_en_reparation}
        - Réformés: {materiels_reformes}
        
        **👥 Utilisateurs:** {total_users}
        
        **📋 Demandes:**
        - Total: {total_demandes}
        - Acceptées: {demandes_acceptees}
        """)
        
    except Exception as e:
        st.sidebar.error(f"Erreur stats: {e}")

# Help section
with st.expander("ℹ️ Guide d'utilisation"):
    st.markdown("""
    **Fournisseurs IA disponibles :**
    
    🤖 **Anthropic Claude** (Recommandé)
    - Excellent pour les requêtes complexes
    - Installation: `pip install anthropic`
    - Variable d'environnement: `ANTHROPIC_API_KEY`
    
    🔍 **Google Gemini** (Gratuit avec limites)
    - Bon équilibre performance/coût
    - Installation: `pip install google-generativeai`
    - Variable d'environnement: `GOOGLE_API_KEY`
    
    🏠 **Hugging Face** (Gratuit, local)
    - Fonctionne hors ligne
    - Installation: `pip install transformers torch`
    - Aucune clé API requise
    
    🦙 **Ollama** (Gratuit, local)
    - Modèles locaux haute performance
    - Installation: Télécharger depuis ollama.ai
    - Lancer: `ollama run llama2`
    
    **Exemples de questions :**
    - "Combien d'équipements sont disponibles ?"
    - "Quels équipements sont affectés à [Nom] ?"
    - "Liste des équipements en panne"
    """)

# Footer
st.markdown("---")
st.markdown("*Assistant IA multi-fournisseurs pour la gestion d'équipements informatiques*")