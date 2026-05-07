# 🍳 FridgeToFeast

**FridgeToFeast** is an intelligent web application that uses computer vision to detect ingredients from images and recommends delicious recipes based on what you have available. Instead of typing out what's in your fridge, simply snap a picture, and our custom YOLOv8 model will analyze the contents instantly!

## ✨ Features

- **AI Ingredient Detection**: Powered by a custom-trained YOLOv8 architecture to recognize 20 different culinary ingredients.
- **Smart Recipe Matching**: A proprietary algorithm cross-references detected ingredients with a robust recipe dataset to find the best match.
- **Privacy-First**: Images are processed directly on your local backend server and are never stored.
- **Premium Frontend SPA**: A dynamic, modular, and beautiful Single Page Application built with modern HTML, Tailwind CSS, and Vanilla JavaScript. Features dark mode, floating navigation (Dynamic Island), and smooth animations.

---

## 📂 Project Structure

```
fridge_to_feast/
│
├── backend/                  # FastAPI Backend Server
│   ├── main.py               # Main API endpoints (FastAPI)
│   ├── model/                # YOLOv8 weights (best.pt)
│   ├── dataset/              # Recipe datasets (JSON/CSV)
│   ├── utils/                # Helper scripts (matcher.py)
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # Frontend Single Page Application
    ├── index.html            # Landing page
    ├── demo.html             # Main application interface (Upload & Results)
    ├── methodology.html      # Model performance and training details
    ├── author.html           # About the developer
    ├── components/           # Reusable HTML components (Navbar, Footer)
    ├── js/                   # Shared scripts (main.js)
    ├── script.js             # API integration and logic
    └── images/               # Assets
```

---

## 🚀 Getting Started (Local Development)

To run this application locally, you will need to start both the Backend server and the Frontend.

### 1. Backend Setup (FastAPI + YOLOv8)

The backend handles image processing and recipe matching.

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   Make sure you have Python installed, then run:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: You will need `fastapi`, `uvicorn`, `ultralytics`, `pillow`, `pandas`, etc.)*

3. **Start the server**:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start running on `http://127.0.0.1:8000`.

### 2. Frontend Setup (HTML/JS)

The frontend is a static web application that communicates with the backend API.

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Serve the files**:
   You can use any standard static file server. For example, using Python's built-in server:
   ```bash
   python -m http.server 5500
   ```
   Or use **VSCode Live Server**.

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:5500` (or whichever port your server is using).

---

## 🧠 Model Training & Methodology

The core vision model was trained using **YOLOv8** on a custom curated dataset. It has been fine-tuned to recognize a variety of specific kitchen ingredients with high precision.

- You can view the full training process, notebooks, and dataset on Kaggle:
  [View Training Code on Kaggle](https://www.kaggle.com/code/bertnardomariouskono/fridge-to-feast)

- For in-depth metrics (Confusion Matrix, F1-Curve, PR-Curve), please visit the **Methodology** page inside the web application.

---

## 👨‍💻 Developer

Developed by **Marious Kono**.
- **GitHub**: [@mariouskono](https://github.com/mariouskono)
- **Role**: AI/ML Engineer & Fullstack Developer

*Feel free to explore the repository, submit issues, or contribute!*
