"""
Module 5: PDF Reassembly
Convert processed images back to PDF format
"""

import io
import fitz  # PyMuPDF
from PIL import Image
import numpy as np
from typing import List


def images_to_pdf(images: List[np.ndarray], output_path: str):
    """
    처리된 이미지들을 하나의 PDF 파일로 재조립
    
    Args:
        images: 처리 완료된 이미지 리스트 (각 페이지)
        output_path: 출력 PDF 파일 경로
    
    Notes:
        - 원본 PDF의 페이지 크기를 유지
        - 이미지 품질을 최대한 보존
    """
    doc = fitz.open()  # 빈 PDF 생성
    
    for idx, img_array in enumerate(images):
        # Numpy array -> PIL Image
        img_pil = Image.fromarray(img_array)
        
        # PIL Image -> bytes
        img_bytes = io.BytesIO()
        img_pil.save(img_bytes, format='PNG', optimize=False)
        img_bytes.seek(0)
        
        # 이미지 크기에 맞는 페이지 생성
        img_doc = fitz.open(stream=img_bytes, filetype="png")
        rect = img_doc[0].rect
        
        # 새 페이지 추가
        page = doc.new_page(width=rect.width, height=rect.height)
        
        # 이미지 삽입
        page.insert_image(page.rect, stream=img_bytes.getvalue())
        
        img_doc.close()
        print(f"   ✓ Page {idx + 1} added to PDF")
    
    # PDF 저장
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    
    print(f"   ✓ PDF saved: {output_path}")


def pdf_to_docx_fallback(pdf_path: str, docx_path: str):
    """
    PDF를 DOCX로 변환 (pdf2docx 사용)
    
    Args:
        pdf_path: 입력 PDF 경로
        docx_path: 출력 DOCX 경로
    
    Notes:
        이 함수는 기존 pdf2docx 라이브러리를 재사용합니다.
        완벽한 레이아웃 보존은 보장되지 않지만, 편집 가능한 DOCX 제공.
    """
    try:
        from pdf2docx import Converter
        
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        
        print(f"   ✓ DOCX conversion complete: {docx_path}")
        return True
    
    except Exception as e:
        print(f"   ✗ DOCX conversion failed: {e}")
        return False
