#!/usr/bin/env python3
"""
Advanced PDF Translation Script
완전한 레이아웃 보존 및 깨끗한 Mono 출력을 위한 새로운 PDF 번역 파이프라인

Usage:
    python advanced-translate-pdf.py <input.pdf> <output.pdf> <target_lang>
    
Example:
    python advanced-translate-pdf.py document.pdf translated.pdf en
    python advanced-translate-pdf.py report.pdf report_ko.pdf ko
"""

import sys
import json
import os
from pathlib import Path

# 모듈 임포트
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'advanced_pdf_translate'))

from rasterize import pdf_to_images, get_pdf_info
from ocr import TextExtractor, detect_language
from inpaint import create_mask_from_boxes, inpaint_text
from render import TextRenderer
from reassemble import images_to_pdf, pdf_to_docx_fallback


def translate_pdf(input_path: str, output_path: str, target_lang: str, dpi: int = 200):
    """
    5단계 PDF 번역 파이프라인
    
    Args:
        input_path: 입력 PDF 파일 경로
        output_path: 출력 파일 경로 (.pdf 또는 .docx)
        target_lang: 목표 언어 ('en', 'ko', 'ja', 'zh-cn' 등)
        dpi: 래스터화 해상도 (기본값: 300)
    
    Returns:
        dict: 처리 결과 및 메타데이터
    """
    
    print(f"\n{'='*60}")
    print(f"🚀 Advanced PDF Translation Pipeline")
    print(f"{'='*60}")
    print(f"📄 Input: {input_path}")
    print(f"🎯 Target Language: {target_lang}")
    print(f"💾 Output: {output_path}")
    print(f"{'='*60}\n")
    
    try:
        # PDF 정보 확인
        pdf_info = get_pdf_info(input_path)
        print(f"📊 PDF Info: {pdf_info['page_count']} pages, {pdf_info['file_size_mb']} MB")
        print()
        
        # Stage 1: PDF → Images (긴 쪽 최대 4000px로 제한하여 PaddleOCR 안정성 확보)
        print(f"[1/5] 📸 Rasterizing PDF with max_side=4000 limit...")
        images = pdf_to_images(input_path, max_side=4000)
        print()
        
        # 언어 자동 감지 (OCR 언어 설정용)
        # 첫 페이지에서 약간의 텍스트를 추출하여 언어 감지
        ocr_lang = 'korean'  # 기본값
        
        processed_images = []
        total_text_blocks = 0
        
        for page_num, img in enumerate(images, 1):
            print(f"--- Page {page_num}/{len(images)} ---")
            
            # Stage 2: OCR
            print(f"[2/5] 🔍 Extracting text with OCR (PaddleOCR)...")
            extractor = TextExtractor(lang=ocr_lang, use_gpu=False)
            text_blocks = extractor.extract(img)
            total_text_blocks += len(text_blocks)
            
            if not text_blocks:
                print(f"   ⚠ No text found, skipping inpainting/translation")
                processed_images.append(img)
                print()
                continue
            
            # Stage 3: Inpainting
            print(f"[3/5] 🎨 Removing original text (inpainting and solid fill)...")
            # dilation_ratio 0.01은 4000px 기준 40px 확장 (글자 외곽 잔상 제거용)
            mask = create_mask_from_boxes(img.shape, text_blocks, dilation_ratio=0.01)
            clean_img = inpaint_text(img, mask, text_blocks=text_blocks)
            print(f"   ✓ Text removed from {len(text_blocks)} regions")
            
            # Stage 4: Translation & Rendering
            print(f"[4/5] 🌐 Translating and rendering text...")
            renderer = TextRenderer()
            final_img = renderer.render(clean_img, text_blocks, target_lang)
            
            processed_images.append(final_img)
            print()
        
        # Stage 5: Reassembly
        print(f"[5/5] 📦 Reassembling PDF...")
        
        # 출력 포맷 결정
        is_docx = output_path.lower().endswith('.docx')
        
        if is_docx:
            # PDF로 임시 저장 후 DOCX 변환
            temp_pdf = output_path.replace('.docx', '_temp.pdf')
            images_to_pdf(processed_images, temp_pdf)
            
            print(f"   🔄 Converting PDF to DOCX...")
            success = pdf_to_docx_fallback(temp_pdf, output_path)
            
            # 임시 파일 삭제
            if os.path.exists(temp_pdf):
                os.remove(temp_pdf)
            
            if not success:
                raise Exception("DOCX conversion failed")
        else:
            # PDF로 직접 저장
            images_to_pdf(processed_images, output_path)
        
        print()
        print(f"{'='*60}")
        print(f"✅ Translation Complete!")
        print(f"{'='*60}")
        
        return {
            "success": True,
            "output_path": output_path,
            "pages_processed": len(images),
            "text_blocks_total": total_text_blocks,
            "file_size": os.path.getsize(output_path)
        }
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "error": str(e)
        }


def main():
    """CLI 엔트리포인트"""
    
    if len(sys.argv) < 4:
        print("Usage: python advanced-translate-pdf.py <input.pdf> <output.pdf> <target_lang>")
        print()
        print("Target languages:")
        print("  en    - English")
        print("  ko    - Korean")
        print("  ja    - Japanese")
        print("  zh-cn - Chinese (Simplified)")
        print("  zh-tw - Chinese (Traditional)")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_pdf = sys.argv[2]
    target_lang = sys.argv[3]
    
    # 입력 파일 존재 확인
    if not os.path.exists(input_pdf):
        print(f"❌ Error: Input file not found: {input_pdf}")
        sys.exit(1)
    
    # 번역 실행
    result = translate_pdf(input_pdf, output_pdf, target_lang)
    
    # JSON 결과 출력 (TypeScript에서 파싱용)
    print("\n__JSON_START__")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("__JSON_END__")
    
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
