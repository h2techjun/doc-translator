from PIL import Image, ImageChops
import os

def process_logo():
    img_path = r'C:\Users\gagum\.gemini\antigravity\brain\f8840a58-59a7-466f-8570-5b62949952c6\doctranslation_logo_wide_v2_1769797436096.png'
    output_path = r'd:\02_Project\00_Translation\public\adsense_logo.jpg'
    
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return

    img = Image.open(img_path).convert('RGB')
    
    # 1. Bounding box of non-white content
    bg = Image.new('RGB', img.size, (255, 255, 255))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if not bbox:
        print("Error: Image is blank")
        return
        
    cropped = img.crop(bbox)
    w, h = cropped.size
    
    # 2. Target 5:1 ratio
    target_ratio = 5.0
    current_ratio = w / h
    
    if current_ratio < target_ratio:
        # Too tall, need horizontal padding
        new_h = h
        new_w = h * target_ratio
    else:
        # Too wide, need vertical padding
        new_w = w
        new_h = w / target_ratio
        
    # 3. Create new image with padding
    final = Image.new('RGB', (int(new_w), int(new_h)), (255, 255, 255))
    # Center the cropped image
    paste_x = int((new_w - w) / 2)
    paste_y = int((new_h - h) / 2)
    final.paste(cropped, (paste_x, paste_y))
    
    # 4. Save and optimize for size (<150kb)
    final.save(output_path, 'JPEG', quality=90, optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Success: Saved to {output_path} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    process_logo()
