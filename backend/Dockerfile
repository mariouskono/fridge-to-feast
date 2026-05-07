# Menggunakan arsitektur Python ringan
FROM python:3.11-slim

# Membuka port yang diwajibkan oleh Hugging Face
EXPOSE 7860

# Menginstal dependensi library sistem untuk OpenCV (dibutuhkan YOLO)
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Menentukan jalur direktori kerja
WORKDIR /app

# Menginstal pustaka Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Menyalin seluruh repositori kode
COPY . .

# Mengeksekusi server web
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]