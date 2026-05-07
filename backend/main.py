from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os
from utils.matcher import load_datasets, get_recommendations, TRANSLATION_MAP

# Inisialisasi Arsitektur FastAPI
app = FastAPI(title="Fridge-to-Feast API", version="1.1")

# Implementasi Keamanan Lintas Domain (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Mendukung akses dari Vercel/GitHub Pages
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Inisialisasi Memori Deklaratif (Data Resep)
print("--- Memulai Proses Pemuatan Dataset ---")
df_recipes = load_datasets()
if not df_recipes.empty:
    print(f"STATUS: Total {len(df_recipes)} resep berhasil diintegrasikan ke RAM.")

# 2. Inisialisasi Model Analisis Visual
print("--- Memuat Arsitektur YOLOv8 ---")
MODEL_PATH = os.path.join("model", "best.pt")
try:
    vision_model = YOLO(MODEL_PATH)
    print("STATUS: Model Visi Komputer aktif dan siap digunakan.")
except Exception as e:
    vision_model = None
    print(f"CRITICAL ERROR: Gagal memuat bobot model - {str(e)}")

@app.get("/")
def health_check():
    """Sistem validasi status server."""
    return {
        "status": "active", 
        "model_loaded": vision_model is not None,
        "total_recipes_in_memory": len(df_recipes)
    }

@app.post("/api/analyze")
async def analyze_fridge(image: UploadFile = File(...)):
    """Titik akhir utama untuk analisis sitra dan pencarian rekomendasi."""
    if vision_model is None:
        raise HTTPException(status_code=500, detail="Infrastruktur Visi Komputer tidak tersedia.")
    
    try:
        # Akuisisi byte citra dari klien
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes))
        
        # Eksekusi Visi Komputer (Confidence Threshold = 0.4)
        results = vision_model.predict(img, conf=0.4)
        
        # Ekstraksi dan eliminasi duplikasi deteksi
        detected_set = set()
        for r in results:
            for box in r.boxes:
                class_id = int(box.cls[0].item())
                detected_set.add(vision_model.names[class_id])
                
        detected_list = list(detected_set)
        
        # Pemrosesan Terjemahan
        translated_list = []
        for item in detected_list:
            if item in TRANSLATION_MAP:
                translated_list.append(TRANSLATION_MAP[item][0].title())
        
        # Pemrosesan Rekomendasi
        recipes = get_recommendations(detected_list, df_recipes, top_n=3)
        
        # Struktur Data Respons (JSON)
        return {
            "success": True,
            "detected_raw": detected_list,
            "detected_translated": translated_list,
            "recipes_found": len(recipes),
            "recommendations": recipes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomali sistem terdeteksi: {str(e)}")