import json
import cv2
import numpy as np
import tensorflow as tf

# Load model & labels
model = tf.keras.models.load_model("emotion_model.h5")
with open("labels.json") as f:
    idx_to_label = json.load(f)
# Ensure indices are strings in JSON; convert to int mapping
idx_to_label = {int(k): v for k, v in idx_to_label.items()}

# Face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades +
                                     "haarcascade_frontalface_default.xml")

EMOJI = {
    "angry": "😠", "disgust": "🤢", "fear": "😱",
    "happy": "😊", "sad": "😢", "surprise": "😮", "neutral": "😐"
}

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Could not access webcam.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(50, 50))

    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = face.astype("float32") / 255.0
        face = np.expand_dims(face, axis=(0, -1))  # (1, 48, 48, 1)

        probs = model.predict(face, verbose=0)[0]
        top_idx = int(np.argmax(probs))
        top_label = idx_to_label[top_idx]
        score = float(probs[top_idx])

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 180, 255), 2)
        cv2.putText(frame, f"{top_label} ({score:.2f}) {EMOJI.get(top_label,'')}",
                    (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 180, 255), 2, cv2.LINE_AA)

    cv2.imshow("Your FER2013 CNN (q to quit)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
