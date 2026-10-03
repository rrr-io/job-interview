"""Scale member cutouts so every face is the same size (128px wide).

Usage: python scripts/normalize_cutouts.py src/assets/chaos/members/new.PNG [face_width_px]
Needs: pip install pillow opencv-python
If the face is not found (side views, faces looking down), pass its width by hand:
measure it in the original image, cheek to cheek plus a little margin.
"""

import sys

import cv2
import numpy as np
from PIL import Image

TARGET = 128

path = sys.argv[1]
image = Image.open(path).convert("RGBA")
image = image.crop(image.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())

if len(sys.argv) > 2:
    face = int(sys.argv[2])
else:
    flat = Image.new("RGBA", image.size, "white")
    flat.alpha_composite(image)
    gray = cv2.cvtColor(np.array(flat.convert("RGB")), cv2.COLOR_RGB2GRAY)
    detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")
    found = detector.detectMultiScale(gray, 1.08, 5, minSize=(int(image.width * 0.04),) * 2)
    if not len(found):
        sys.exit("No face found: pass the face width by hand")
    face = max(found, key=lambda box: box[2])[2]

scale = TARGET / face
image = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
image.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)
print(f"{path}: face {face}px -> {TARGET}px, now {image.width}x{image.height}")
