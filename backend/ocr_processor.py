from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import numpy as np
import cv2
import io
import easyocr

app = Flask(__name__)
CORS(app)  # allow frontend requests from React
reader = easyocr.Reader(['en'])

def decode_image(file_data):
    return Image.open(io.BytesIO(file_data))

def detect_braille(image):
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 120, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return len(contours) > 50

def translate_braille():
    return "Braille detected. Braille translation support coming soon."

@app.route("/ocr", methods=["POST"])
def process_ocr():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"].read()
    image = decode_image(image_file)

    if detect_braille(image):
        return jsonify({"text": translate_braille(), "type": "braille"})

    text_easyocr = reader.readtext(np.array(image), detail=0)
    if text_easyocr and any(len(t) > 4 for t in text_easyocr):
        return jsonify({"text": " ".join(text_easyocr), "type": "handwritten"})

    text = pytesseract.image_to_string(image)
    return jsonify({"text": text.strip(), "type": "printed"})

if __name__ == "__main__":
    app.run(debug=True)
