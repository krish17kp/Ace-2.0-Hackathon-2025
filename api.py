# api.py  —  FastAPI backend for emotion inference (FER2013, 48x48 grayscale)
import os
from typing import List, Dict, Any

import numpy as np
import cv2

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ----------------------------
# Paths & constants
# ----------------------------
HERE = os.path.dirname(os.path.abspath(__file__))

# Prefer the TF 2.15-saved model if present; else try the other name
CANDIDATE_MODELS = [
    os.path.join(HERE, "model_file_30epochs.h5"),
    os.path.join(HERE, "emotion_model.h5"),
]

CASCADE_PATH = os.path.join(HERE, "haarcascade_frontalface_default.xml")
LABELS: List[str] = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

# ----------------------------
# Model loader with fallback
# ----------------------------
def _load_model_dynamic(model_path: str):
    """
    Try tf.keras loader first (TensorFlow 2.x). If deserialization fails with the
    classic 'batch_shape' / Keras-3 mismatch, try the standalone Keras 3 loader.
    """
    # 1) Try tf.keras (TensorFlow 2.x)
    try:
        from tensorflow.keras.models import load_model as tfk_load_model
        return tfk_load_model(model_path, compile=False)
    except Exception as e_tf:
        # 2) Try Keras 3 loader (only if installed)
        try:
            import keras  # standalone Keras 3
            return keras.saving.load_model(model_path, compile=False)
        except Exception as e_k3:
            raise RuntimeError(
                f"Failed to load model '{model_path}'. "
                f"tf.keras error: {type(e_tf).__name__}: {e_tf}\n"
                f"Keras 3 error: {type(e_k3).__name__}: {e_k3}\n"
                f"Tip: Use a model saved with the same major Keras/TF version as your runtime."
            )

def _pick_existing_model() -> str:
    for p in CANDIDATE_MODELS:
        if os.path.isfile(p):
            return p
    raise FileNotFoundError(
        f"No model file found. Looked for: {', '.join(CANDIDATE_MODELS)} "
        f"in {HERE}"
    )

MODEL_PATH = _pick_existing_model()
print(f"🔎 Using model: {MODEL_PATH}")

# Load the CNN once at startup
model = _load_model_dynamic(MODEL_PATH)

# ----------------------------
# Haar cascade (face detection)
# ----------------------------
face_detect = cv2.CascadeClassifier(CASCADE_PATH)
if face_detect.empty():
    raise RuntimeError(
        f"Could not load Haar cascade at '{CASCADE_PATH}'. "
        f"Ensure the file exists next to api.py."
    )

# ----------------------------
# FastAPI app & CORS
# ----------------------------
app = FastAPI(title="Emotion API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # loosen for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Inference helpers
# ----------------------------
def _preprocess_face(gray_img: np.ndarray, bbox) -> np.ndarray:
    x, y, w, h = bbox
    face = gray_img[y : y + h, x : x + w]
    face = cv2.resize(face, (48, 48)).astype("float32") / 255.0
    face = np.expand_dims(face, axis=(0, -1))  # shape: (1, 48, 48, 1)
    return face

def predict_emotions_bgr(img_bgr: np.ndarray) -> List[Dict[str, Any]]:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Tune these if needed
    faces = face_detect.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(60, 60)
    )

    out: List[Dict[str, Any]] = []
    for (x, y, w, h) in faces:
        face_input = _preprocess_face(gray, (x, y, w, h))
        probs = model.predict(face_input, verbose=0)[0]
        top_idx = int(np.argmax(probs))
        out.append(
            {
                "box": [int(x), int(y), int(w), int(h)],
                "top": LABELS[top_idx],
                "score": float(probs[top_idx]),
                "probs": {LABELS[i]: float(p) for i, p in enumerate(probs)},
            }
        )
    return out

# ----------------------------
# Routes
# ----------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": os.path.basename(MODEL_PATH),
        "labels": LABELS,
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    data = await file.read()
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image data.")
    faces = predict_emotions_bgr(img)
    return {"faces": faces}

# (Optional) run with: python api.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=7860, reload=True)
