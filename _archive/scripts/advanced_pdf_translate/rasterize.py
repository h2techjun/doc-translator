"""
Module 1: PDF Rasterization
Convert PDF pages to high-resolution images for processing
"""

import fitz  # PyMuPDF
import numpy as np
from typing import List


def pdf_to_images(pdf_path: str, max_side: int = 4000) -> List[np.ndarray]:
    """
    PDF의 각 페이지를 이미지로 변환하되, PaddleOCR 안정 범위를 위해 리사이징 수행
    
    Args:
        pdf_path: 입력 PDF 파일 경로
        max_side: 이미지의 긴 쪽 최대 픽셀 수 (기본 4000, PaddleOCR 안정 범위)
    
    Returns:
        List[np.ndarray]: RGB 이미지 배열 리스트
    """
    doc = fitz.open(pdf_path)
    images = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        rect = page.rect
        
        # 원본 크기 기반으로 리사이징 비율 계산
        width, height = rect.width, rect.height
        current_max = max(width, height)
        
        # 긴 쪽이 max_side를 넘으면 비율 유지하며 축소
        if current_max > max_side:
            zoom = max_side / current_max
        else:
            # 해상도 확보를 위해 기본적인 고해상도(300DPI급) 시도 (72 * 4.16 = 300)
            # 단, 이 경우에도 긴 쪽이 max_side를 넘지 않도록 조정
            zoom = min(4.16, max_side / current_max)
            
        mat = fitz.Matrix(zoom, zoom)
        
        # 페이지를 Pixmap으로 변환
        pix = page.get_pixmap(matrix=mat)
        
        # Numpy array로 변환 (RGB만 추출)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        
        # Alpha 채널 제거
        if pix.n == 4:
            images.append(img[:, :, :3])
        else:
            images.append(img)
            
        print(f"   ✓ Page {page_num+1} rasterized: {pix.w}x{pix.h} (zoom: {zoom:.2f})")
    
    doc.close()
    return images


def get_pdf_info(pdf_path: str) -> dict:
    """
    PDF 메타데이터 추출 (디버깅용)
    
    Returns:
        {
            'page_count': int,
            'has_text': bool,
            'file_size_mb': float
        }
    """
    doc = fitz.open(pdf_path)
    
    info = {
        'page_count': len(doc),
        'has_text': any(page.get_text().strip() for page in doc),
        'file_size_mb': round(doc.metadata.get('filesize', 0) / (1024 * 1024), 2)
    }
    
    doc.close()
    return info
