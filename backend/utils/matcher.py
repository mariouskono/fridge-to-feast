import pandas as pd
import os
import glob

# Kamus Pemetaan (Translation Middleware): YOLOv8 Classes (English) -> Cookpad Keywords (Indonesian)
TRANSLATION_MAP = {
    'chicken': ['ayam'],
    'beef': ['sapi', 'daging sapi'],
    'fish': ['ikan'],
    'egg': ['telur'],
    'tofu': ['tahu'],
    'tomato': ['tomat'],
    'garlic': ['bawang putih'],
    'onion': ['bawang merah', 'bawang bombay'],
    'potato': ['kentang'],
    'carrot': ['wortel'],
    'cabbage': ['kubis', 'kol'],
    'broccoli': ['brokoli'],
    'cucumber': ['timun', 'mentimun'],
    'shrimp': ['udang'],
    'cauliflower': ['kembang kol'],
    'ginger': ['jahe'],
    'bell_pepper': ['paprika'],
    'kumquat': ['jeruk'],
    'lemon': ['lemon', 'jeruk nipis'],
    'pork': ['babi'],
    'small_pepper': ['cabai', 'cabe']
}

def load_datasets():
    """Melakukan agregasi dinamis terhadap seluruh file dataset terpisah ke dalam RAM."""
    dataset_dir = "dataset"
    # Membaca seluruh file dengan pola nama dataset-*.csv
    file_pattern = os.path.join(dataset_dir, "dataset-*.csv")
    all_files = glob.glob(file_pattern)
    
    df_list = []
    for file in all_files:
        try:
            df = pd.read_csv(file)
            df_list.append(df)
            print(f"INFO: Memuat {os.path.basename(file)} ({len(df)} baris)")
        except Exception as e:
            print(f"WARNING: Gagal memuat data dari {file} - {str(e)}")

    if not df_list:
        print("CRITICAL ERROR: Tidak ada dataset yang berhasil dimuat.")
        return pd.DataFrame() # Mengembalikan DataFrame kosong sebagai fallback

    # Menggabungkan seluruh DataFrame menjadi satu entitas di memori
    combined_df = pd.concat(df_list, ignore_index=True)
    
    # Pembersihan Data (Data Cleaning)
    combined_df.dropna(subset=['Ingredients', 'Title'], inplace=True)
    return combined_df

def get_recommendations(detected_classes_english, df_recipes, top_n=3):
    """Menerjemahkan entitas kelas dan meranking resep berdasarkan irisan bahan."""
    if df_recipes is None or df_recipes.empty:
        return []

    # 1. Konversi Lintas Bahasa
    indonesian_keywords = []
    for item in detected_classes_english:
        if item in TRANSLATION_MAP:
            indonesian_keywords.extend(TRANSLATION_MAP[item])
    
    if not indonesian_keywords:
        return []

    # 2. Algoritma Pencocokan Linear (Scoring Mechanism)
    def calculate_score(ingredients_text):
        text_lower = str(ingredients_text).lower()
        # Hitung probabilitas kemunculan bahan di dalam resep
        score = sum(1 for kw in indonesian_keywords if kw in text_lower)
        return score

    # Operasi Vectorized untuk efisiensi waktu komputasi
    df_recipes['match_score'] = df_recipes['Ingredients'].apply(calculate_score)
    
    # 3. Ekstraksi Top-N
    best_matches = df_recipes[df_recipes['match_score'] > 0].sort_values(by='match_score', ascending=False).head(top_n)
    
    recommendations = []
    for _, row in best_matches.iterrows():
        recommendations.append({
            "title": row.get('Title', 'Tanpa Judul'),
            "ingredients": row.get('Ingredients', 'Data bahan tidak tersedia'),
            "steps": row.get('Steps', 'Data langkah tidak tersedia'),
            "url": row.get('URL', '#'),
            "match_score": int(row['match_score'])
        })
        
    return recommendations