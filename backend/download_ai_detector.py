# backend/download_ai_detector.py
import os
import sys
import time
import urllib.request

DEST_DIR = os.path.join(os.path.dirname(__file__), "models", "ai_detector")
os.makedirs(DEST_DIR, exist_ok=True)

BASE_URL = "https://huggingface.co/umm-maybe/AI-image-detector/resolve/main"
FILES = [
    ("config.json", f"{BASE_URL}/config.json"),
    ("preprocessor_config.json", f"{BASE_URL}/preprocessor_config.json"),
    ("pytorch_model.bin", f"{BASE_URL}/pytorch_model.bin"),
]

def download_file(filename, url):
    dest_path = os.path.join(DEST_DIR, filename)
    existing_size = os.path.getsize(dest_path) if os.path.exists(dest_path) else 0

    if filename == "pytorch_model.bin" and existing_size >= 347000000:
        print(f"[OK] {filename} already fully downloaded ({round(existing_size / (1024*1024), 2)} MB).")
        return dest_path
    elif filename != "pytorch_model.bin" and existing_size > 100:
        print(f"[OK] {filename} already downloaded.")
        return dest_path

    headers = {"User-Agent": "Mozilla/5.0"}
    mode = "wb"
    if existing_size > 0 and filename == "pytorch_model.bin":
        headers["Range"] = f"bytes={existing_size}-"
        mode = "ab"
        print(f"Resuming {filename} from {existing_size / (1024*1024):.1f} MB...")
    else:
        print(f"Downloading {filename} from {url}...")

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response, open(dest_path, mode) as out_file:
            content_range = response.headers.get("Content-Range")
            if content_range:
                # e.g., bytes 313524224-347585099/347585100
                total_size = int(content_range.split("/")[-1])
            else:
                total_size = existing_size + int(response.headers.get("Content-Length", 0))

            downloaded = existing_size
            chunk_size = 1024 * 1024
            t0 = time.time()
            last_print = t0

            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                out_file.write(chunk)
                downloaded += len(chunk)
                now = time.time()
                if now - last_print >= 1.5 or downloaded >= total_size:
                    mb = downloaded / (1024 * 1024)
                    total_mb = total_size / (1024 * 1024)
                    pct = (downloaded / total_size * 100) if total_size > 0 else 0
                    print(f"[{filename}] {mb:.1f} MB / {total_mb:.1f} MB ({pct:.1f}%)")
                    last_print = now

        print(f"[DONE] Successfully saved {filename} to {dest_path}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
        raise

    return dest_path

if __name__ == "__main__":
    for fname, furl in FILES:
        download_file(fname, furl)
    print("All AI Image Detector assets verified.")
