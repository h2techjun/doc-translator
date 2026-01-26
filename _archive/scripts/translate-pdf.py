#!/usr/bin/env python3
"""
🔗 PDF 번역 브릿지 (pdf2zh + OCR 하이브리드)

1. 텍스트 문서 -> pdf2zh 즉시 번역
2. 이미지 문서 -> Tesseract OCR로 텍스트 레이어 생성 -> pdf2zh 번역

사용법:
    python translate-pdf.py <input.pdf> <output.pdf> <target_lang>
"""

import sys
import os
import json
import shutil
import glob
from langdetect import detect
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

# 0. Tesseract 경로 설정 (Windows)
POSSIBLE_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.getenv("TESSERACT_CMD", "tesseract")
]
TESSERACT_CMD = None
for path in POSSIBLE_PATHS:
    if os.path.exists(path):
        TESSERACT_CMD = path
        break
    if shutil.which(path):
        TESSERACT_CMD = shutil.which(path)
        break

if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

# Stdout 인코딩 설정
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass

def ocr_processing(input_pdf):
    """
    이미지 기반 PDF에 텍스트 레이어를 입힘 (Searchable PDF 생성)
    """
    if not TESSERACT_CMD:
        print("   [WARN] Tesseract를 찾을 수 없어 OCR을 건너뜁니다.")
        return input_pdf

    try:
        print(f"   [INFO] 이미지 문서 감지! OCR(문자 인식) 전처리 수행 중...")
        print(f"   [INFO] Tesseract 엔진: {TESSERACT_CMD}")
        
        doc = fitz.open(input_pdf)
        ocr_pdf_path = os.path.splitext(input_pdf)[0] + "_ocr.pdf"
        output_doc = fitz.open()

        for i, page in enumerate(doc):
            # 페이지를 이미지로 변환 (300 DPI)
            pix = page.get_pixmap(dpi=300)
            img_data = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_data))
            
            # Tesseract로 PDF(데이터 포함) 생성
            # 8개 언어 데이터 모두 활용 (Multi-language OCR) -> 속도 최적화를 위해 주요 언어로 축소
            # 순서: kor+eng (우선순위) + chi_sim
            ocr_langs = 'eng+kor+chi_sim'
            
            try:
                pdf_bytes = pytesseract.image_to_pdf_or_hocr(image, extension='pdf', lang=ocr_langs)
            except Exception as e:
                # 에러 발생 시(데이터 누락 등) 안전하게 eng+kor로 폴백, 그것도 안되면 eng
                print(f"   [WARN] Multi-language OCR 실패 ({e}), 기본값(eng+kor) 사용")
                try:
                    pdf_bytes = pytesseract.image_to_pdf_or_hocr(image, extension='pdf', lang='eng+kor')
                except:
                    pdf_bytes = pytesseract.image_to_pdf_or_hocr(image, extension='pdf', lang='eng')
            
            # 생성된 PDF 조각을 병합
            img_pdf_doc = fitz.open("pdf", pdf_bytes)
            output_doc.insert_pdf(img_pdf_doc)
            
            if (i+1) % 5 == 0 or (i+1) == len(doc):
                percent = int((i + 1) / len(doc) * 40) # OCR은 전체 공정의 40% 차지
                print(f"__PROGRESS__ {percent}")
                print(f"   [INFO] OCR 처리 중... ({i+1}/{len(doc)})")

        output_doc.save(ocr_pdf_path)
        doc.close()
        output_doc.close()
        
        print(f"   [INFO] OCR 완료! 임시 파일 생성: {os.path.basename(ocr_pdf_path)}")
        return ocr_pdf_path

    except Exception as e:
        print(f"   [ERROR] OCR 처리 실패: {e}")
        return input_pdf

def detect_language(pdf_path):
    """PDF 문서의 언어를 감지합니다 (노이즈 제거)."""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        # 3페이지까지 텍스트 추출
        for i, page in enumerate(doc):
            if i >= 3: break
            page_text = page.get_text()
            page_text = page_text.replace("Translated Document", "")
            text += page_text
        doc.close()
        
        clean_text = text.strip()
        if not clean_text or len(clean_text) < 20:
            print(f"   [WARN] 텍스트 부족(이미지/스캔본), 'auto'로 설정하고 OCR 준비")
            return 'auto'
            
        lang = detect(clean_text)
        print(f"   [INFO] 언어 감지: {lang} (분석 텍스트: {len(clean_text)}자)")
        return lang
    except Exception as e:
        print(f"   [WARN] 언어 감지 실패: {e}, 기본값('auto') 사용")
        return 'auto'

def translate_pdf(input_path: str, output_path: str, target_lang: str):
    if not os.path.exists(input_path):
        return {"success": False, "error": f"입력 파일을 찾을 수 없습니다: {input_path}"}
    
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    # PATH 강제 설정
    python_dir = os.path.dirname(sys.executable)
    scripts_dir = os.path.join(python_dir, "Scripts")
    os.environ["PATH"] = f"{python_dir};{scripts_dir};" + os.environ["PATH"]

    try:
        print(f"[START] PDF -> PDF 번역 시작 (pdf2zh + OCR Hybrid)")
        print(f"   입력: {input_path}")
        print(f"   목표 언어: {target_lang}")
        
        # 1. 언어 감지
        detected_lang = detect_language(input_path)
        
        # 언어 동일 체크
        if detected_lang != 'auto' and detected_lang == target_lang:
             return {
                "success": False,
                "error": "SAME_LANGUAGE",
                "message": f"원본 언어가 '{detected_lang}'로 감지되었습니다."
            }
        
        # 2. OCR 분기 처리
        process_file = input_path
        if detected_lang == 'auto':
            # 텍스트가 없으면 OCR 수행
            process_file = ocr_processing(input_path)
        
        # 3. pdf2zh 실행
        from pdf2zh.pdf2zh import main as pdf2zh_main
        
        original_argv = sys.argv.copy()
        original_cwd = os.getcwd()
        
        input_dir = os.path.dirname(os.path.abspath(process_file))
        input_basename = os.path.basename(process_file)
        
        os.chdir(input_dir)
        # pdf2zh는 기본적으로 Mono와 Dual 두 파일을 모두 생성함
        sys.argv = ['pdf2zh', input_basename, '-li', 'auto', '-lo', target_lang, '-s', 'google']
        
        print(f"   [EXEC] pdf2zh 실행 ({input_basename}) [Mono + Dual 생성]")
        print(f"")
        
        try:
            pdf2zh_main()
        except SystemExit:
            pass
        except Exception as e:
            print(f"   [ERROR] pdf2zh 내부 에러: {e}")
            pass
            
        os.chdir(original_cwd)
        sys.argv = original_argv
        
        # 중요: 원본 글자가 겹치는 문제를 피하기 위해 반드시 번역문만 있는(Mono) 버전을 최우선으로 찾는다.
        # pdf2zh는 실제로 filename-zh.pdf, filename-ko.pdf 형식으로 Mono 파일을 생성함
        # OCR된 파일명(_ocr) 기반으로 찾아야 함
        base_name_no_ext = os.path.splitext(input_basename)[0]
        possible_patterns = [
            f"{base_name_no_ext}-{target_lang}.pdf",   # 예: file-ko.pdf (실제 pdf2zh 출력)
            f"{base_name_no_ext}_{target_lang}.pdf",   
            f"{base_name_no_ext}-mono.pdf",
            f"{base_name_no_ext}_mono.pdf",
            f"{base_name_no_ext}-dual.pdf",             # 차선책: Dual (피해야 함)
            f"{base_name_no_ext}_dual.pdf"
        ]
        
        actual_output = None
        # 파일명 직접 매칭
        for pat in possible_patterns:
            full_pat = os.path.join(input_dir, pat)
            if os.path.exists(full_pat):
                print(f"   [INFO] 결과 파일 발견: {pat}")
                actual_output = full_pat
                break
                
        if not actual_output:
            # 못 찾았으면 최근 생성된 PDF 중 원본/OCR본 제외하고 가장 최신
            # 단, Dual보다는 Mono(짧은 이름??) 선호 로직 추가 필요하나 일단 시간순
            pdfs = glob.glob(os.path.join(input_dir, "*.pdf"))
            pdfs = [p for p in pdfs if os.path.abspath(p) not in [os.path.abspath(input_path), os.path.abspath(process_file)]]
            pdfs.sort(key=os.path.getmtime, reverse=True)
            if pdfs:
                actual_output = pdfs[0]
                print(f"   [WARN] 명시적 패턴 매칭 실패, 최근 생성 파일 선택: {os.path.basename(actual_output)}")

        if actual_output:
            # DOCX 변환 처리
            if output_path.lower().endswith('.docx'):
                try:
                    from pdf2docx import Converter
                    print(f"   [INFO] PDF -> DOCX 변환 시작 ({actual_output} -> {output_path})")
                    
                    cv = Converter(actual_output)
                    cv.convert(output_path)
                    cv.close()
                    
                    if os.path.exists(output_path):
                        file_size = os.path.getsize(output_path)
                        return {
                            "success": True, 
                            "output_path": output_path, 
                            "file_size": file_size, 
                            "message": f"번역 및 DOCX 변환 완료 (OCR: {'O' if process_file != input_path else 'X'})"
                        }
                    else:
                        raise Exception("DOCX 파일 생성 실패")
                        
                except Exception as e:
                    print(f"   [ERROR] DOCX 변환 실패: {e}")
                    # 실패 시 PDF라도 반환할지, 에러로 처리할지? 에러 처리
                    return {"success": False, "error": f"DOCX 변환 실패: {str(e)}"}
            
            # PDF 반환 처리
            else:
                shutil.copy2(actual_output, output_path)
                file_size = os.path.getsize(output_path)
                return {
                    "success": True, 
                    "output_path": output_path, 
                    "file_size": file_size, 
                    "message": f"번역 완료 (OCR: {'O' if process_file != input_path else 'X'})"
                }
        else:
            return {"success": False, "error": "출력 파일을 찾을 수 없습니다."}

    except Exception as e:
        import traceback
        return {"success": False, "error": str(e), "traceback": traceback.format_exc()}

def main():
    if len(sys.argv) < 4:
        sys.exit(1)
    
    result = translate_pdf(sys.argv[1], sys.argv[2], sys.argv[3])
    
    print("__JSON_START__")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("__JSON_END__")
    
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main()
