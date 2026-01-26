import fitz
import sys

# stdout UTF-8 강제
sys.stdout.reconfigure(encoding='utf-8')

def analyze_pdf(path):
    doc = fitz.open(path)
    page = doc[0]
    
    # 1. 텍스트 추출
    text = page.get_text()
    print(f"--- TEXT ({len(text)} chars) ---")
    print(text[:200]) # 앞 200자만
    print("-------------------------------")
    
    # 2. 이미지 확인
    images = page.get_images()
    print(f"--- IMAGES ({len(images)}) ---")
    for img in images:
        print(img)
    print("-------------------------------")

    # 3. 그림(Vector) 확인
    drawings = page.get_drawings()
    print(f"--- DRAWINGS ({len(drawings)}) ---")
    
if __name__ == "__main__":
    analyze_pdf(sys.argv[1])
