import os
import shutil

brain_dir = r"C:\Users\Tony\.gemini\antigravity\brain\7bc5350a-07d7-4e16-9ec3-14d70cb9dc4b"
public_dir = r"C:\Users\Tony\.gemini\antigravity\scratch\fit-seven\public"
os.makedirs(public_dir, exist_ok=True)

files = sorted(os.listdir(brain_dir))
html = "<html><body style='background:#111;color:#fff;display:flex;flex-wrap:wrap;gap:20px;font-family:sans-serif;'>"

for f in files:
    if f.startswith("media__") and (f.endswith(".jpg") or f.endswith(".png")):
        shutil.copy2(os.path.join(brain_dir, f), os.path.join(public_dir, f))
        html += f"<div style='border:1px solid #444;padding:10px;border-radius:8px;background:#222;text-align:center;'><h3>{f}</h3><img src='{f}' style='max-height:400px;display:block;'/></div>"

html += "</body></html>"
with open(os.path.join(public_dir, "debug_images.html"), "w") as out:
    out.write(html)
print("Debug page generated successfully!")
