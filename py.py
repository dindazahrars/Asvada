import pandas as pd
import json
import random
from datetime import datetime

# 1. Konfigurasi Data Dummy
# ========================
ingredients_pool = [
    "Bawang Merah", "Bawang Putih", "Garam", "Gula", "Merica", "Kecap Manis", 
    "Minyak Goreng", "Air", "Telur", "Tepung Terigu", "Cabai", "Tomat", 
    "Daun Bawang", "Santan", "Jahe", "Lengkuas", "Serai", "Daun Salam",
    "Ayam", "Daging Sapi", "Tahu", "Tempe", "Ikan"
]

steps_pool = [
    "Siapkan semua bahan dan cuci bersih.",
    "Panaskan minyak dalam wajan dengan api sedang.",
    "Tumis bumbu halus hingga harum dan matang.",
    "Masukkan bahan utama, aduk rata hingga berubah warna.",
    "Tambahkan air secukupnya dan masak hingga mendidih.",
    "Kecilkan api dan biarkan bumbu meresap sempurna.",
    "Koreksi rasa dengan garam dan gula sesuai selera.",
    "Angkat dan sajikan selagi hangat.",
    "Potong-potong bahan pelengkap sesuai selera.",
    "Marinasi bahan utama selama 15 menit agar bumbu meresap."
]

categories = ['Main Course', 'Snack', 'Dessert', 'Breakfast', 'Appetizer', 'Beverage']
difficulties = ['Easy', 'Medium', 'Hard']

# Fungsi Generator JSON
def get_random_ingredients():
    k = random.randint(3, 8)
    items = random.sample(ingredients_pool, k)
    return json.dumps(items)

def get_random_steps():
    k = random.randint(3, 6)
    steps = random.sample(steps_pool, k)
    return json.dumps(steps)

# 2. Proses Pembuatan Data
# ========================
try:
    print("Membaca file nutrition.csv...")
    df = pd.read_csv('nutrition.csv') # Pastikan nama file ini benar
    
    # Ambil sample 200 baris (atau maksimal yang ada)
    n_samples = min(200, len(df))
    df_sample = df.sample(n=n_samples, random_state=42).reset_index(drop=True)
    
    print(f"Memproses {n_samples} data resep...")

    # Buat Dictionary Data Baru
    new_data = {
        'id': range(1, n_samples + 1),
        # Title diambil dari nama makanan di CSV asli
        'title': df_sample['name'].astype(str).str.title(),
        
        # Description dummy
        'description': df_sample['name'].apply(
            lambda x: f"Resep {str(x).title()} yang lezat, praktis, dan mudah dibuat di rumah. Cocok untuk hidangan keluarga."
        ),
        
        # Kolom JSON Array
        'ingredients': [get_random_ingredients() for _ in range(n_samples)],
        'steps': [get_random_steps() for _ in range(n_samples)],
        
        # Data Random Lainnya
        'category': [random.choice(categories) for _ in range(n_samples)],
        'cook_time': [random.randint(10, 60) for _ in range(n_samples)],
        'difficulty': [random.choice(difficulties) for _ in range(n_samples)],
        
        # Image URL dari CSV asli
        'image_url': df_sample['image'],
        
        # Timestamp saat ini
        'created_at': [datetime.now().strftime('%Y-%m-%d %H:%M:%S') for _ in range(n_samples)],
        'servings': [random.randint(1, 6) for _ in range(n_samples)],
        'prep_time': [random.randint(5, 30) for _ in range(n_samples)],
        'status': ['published'] * n_samples
    }

    # Buat DataFrame Hasil
    df_result = pd.DataFrame(new_data)

    # 3. Simpan ke CSV
    output_filename = 'resep_dataset_final.csv'
    df_result.to_csv(output_filename, index=False)
    
    print("="*50)
    print(f"SUKSES! File '{output_filename}' telah berhasil dibuat.")
    print("="*50)
    print("Preview 5 baris pertama:")
    print(df_result[['title', 'category', 'difficulty']].head())

except FileNotFoundError:
    print("ERROR: File 'nutrition.csv' tidak ditemukan. Pastikan file ada di folder yang sama.")
except Exception as e:
    print(f"ERROR: Terjadi kesalahan: {e}")