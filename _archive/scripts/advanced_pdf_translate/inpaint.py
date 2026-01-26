"""
Module 3: Text Inpainting
Remove original text from images using background reconstruction
"""

import cv2
import numpy as np
from typing import List, Dict


def create_mask_from_boxes(image_shape: tuple, text_blocks: List[Dict], dilation_ratio: float = 0.02) -> np.ndarray:
    """
    바운딩 박스로부터 마스크 이미지 생성 (이미지 크기에 비례한 지능형 확장)
    
    Args:
        image_shape: 원본 이미지 shape
        text_blocks: OCR에서 추출한 텍스트 블록
        dilation_ratio: 이미지 긴 쪽 크기 대비 마스크 확장 비율 (잔상 제거를 위해 0.015 -> 0.02 상향)
    
    Returns:
        np.ndarray: Binary mask
    """
    h, w = image_shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # 이미지 크기에 비례하여 dilation 결정 (예: 4000px 기준 약 80px)
    max_dim = max(h, w)
    dilation = max(5, int(max_dim * dilation_ratio)) # 최소 5px 확장
    
    for block in text_blocks:
        bbox = np.array(block['bbox'], dtype=np.int32)
        # 박스 내부 채우기
        cv2.fillPoly(mask, [bbox], 255)
    
    # 텍스트 외곽선 및 안티앨리어싱 잔상까지 확실히 지우기 위해 마스크 확장
    if dilation > 0:
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (dilation, dilation))
        mask = cv2.dilate(mask, kernel, iterations=1)
    
    return mask


def inpaint_text(image: np.ndarray, mask: np.ndarray, text_blocks: List[Dict] = None) -> np.ndarray:
    """
    고품질 텍스트 제거: 외곽 배경색 채우기 + OpenCV Inpainting
    """
    result = image.copy()
    h_img, w_img = image.shape[:2]
    
    # 1단계: 텍스트 박스 외곽 배경색으로 채우기
    if text_blocks:
        for block in text_blocks:
            bbox = np.array(block['bbox'], dtype=np.int32)
            x, y, w, h = cv2.boundingRect(bbox)
            
            # 박스 외곽 테두리 영역 샘플링 (패딩 4~10px)
            pad_outer = 10
            pad_inner = 2
            
            # 외곽 ROI 설정
            y1 = max(0, y - pad_outer)
            y2 = min(h_img, y + h + pad_outer)
            x1 = max(0, x - pad_outer)
            x2 = min(w_img, x + w + pad_outer)
            
            roi = image[y1:y2, x1:x2]
            if roi.size > 0:
                # 텍스트가 없는 외곽 영역의 최빈값(Median)을 배경색으로 사용
                # 중앙 부분(텍스트)을 제외하고 샘플링하는 것이 좋으나 단순 수치 보정으로 대체
                bg_color = np.median(roi, axis=(0, 1)).astype(np.uint8)
                
                # 너무 어두운 배경색(텍스트 색상)이 선택되는 것 방지 (문서 배경은 보통 밝음)
                # 만약 전체가 어둡다면 (0,0,0)에 가까워지겠지만, 흰 배경 문서에서는 200 이상이 정상
                if np.mean(bg_color) < 50: # 너무 어두우면 주변에서 더 넓게 찾거나 흰색으로 폴백
                    bg_color = np.array([255, 255, 255], dtype=np.uint8)

                # 해당 텍스트 블록의 마스크 영역만 색상 채우기
                temp_mask = np.zeros((h_img, w_img), dtype=np.uint8)
                cv2.fillPoly(temp_mask, [bbox], 255)
                
                # 마스크가 확장된 mask와 교차 영역 채우기
                target_mask = temp_mask & mask
                result[target_mask > 0] = bg_color

    # 2단계: OpenCV Inpainting으로 경계선 보정
    # radius를 작게 하여 배경색 채우기 결과를 최대한 보존
    inpainted = cv2.inpaint(result, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    
    return inpainted


def visualize_mask(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """
    디버깅용: 마스크를 이미지에 오버레이
    
    Returns:
        np.ndarray: 마스크가 빨간색으로 표시된 이미지
    """
    overlay = image.copy()
    overlay[mask > 0] = [255, 0, 0]  # 마스크 영역을 빨간색으로
    
    # 50% 투명도로 블렌딩
    result = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)
    
    return result
