"""
Module 4: Translation & Text Rendering
Translate text and render it back onto clean images
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Dict, Tuple
from deep_translator import GoogleTranslator


class TextRenderer:
    """
    번역된 텍스트를 이미지에 렌더링하는 클래스
    """
    
    def __init__(self, font_path: str = None, default_color: Tuple[int, int, int] = (0, 0, 0)):
        """
        Args:
            font_path: 사용할 폰트 파일 경로 (None이면 시스템 기본 폰트)
            default_color: 기본 텍스트 색상 (RGB)
        """
        self.font_path = font_path or self._get_system_font()
        self.default_color = default_color
    
    def _get_system_font(self) -> str:
        """
        시스템 기본 한글 폰트 자동 감지
        """
        import platform
        import os
        
        system = platform.system()
        
        if system == 'Windows':
            # Windows 한글 폰트
            fonts = [
                'C:/Windows/Fonts/malgun.ttf',  # 맑은 고딕
                'C:/Windows/Fonts/NanumGothic.ttf',
                'C:/Windows/Fonts/gulim.ttc'  # 굴림
            ]
        elif system == 'Darwin':  # macOS
            fonts = [
                '/System/Library/Fonts/AppleSDGothicNeo.ttc',
                '/Library/Fonts/NanumGothic.ttf'
            ]
        else:  # Linux
            fonts = [
                '/usr/share/fonts/truetype/nanum/NanumGothic.ttf',
                '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
            ]
        
        for font in fonts:
            if os.path.exists(font):
                return font
        
        # 폴백: PIL 기본 폰트
        return None
    
    def translate_text(self, text: str, target_lang: str) -> str:
        """
        Google Translate API로 텍스트 번역
        
        Args:
            text: 원본 텍스트
            target_lang: 목표 언어 코드 ('en', 'ko', 'ja', 'zh-CN' 등)
        
        Returns:
            번역된 텍스트
        """
        try:
            translator = GoogleTranslator(source='auto', target=target_lang)
            result = translator.translate(text)
            return result
        except Exception as e:
            print(f"   ⚠ Translation failed for '{text[:20]}...': {e}")
            return text  # 번역 실패 시 원본 반환
    
    def auto_fit_font(self, draw: ImageDraw.Draw, text: str, bbox: List[List[float]], 
                      max_size: int = 50, min_size: int = 8) -> Tuple[ImageFont.FreeTypeFont, int]:
        """
        텍스트가 바운딩 박스 안에 들어가도록 폰트 크기 자동 조절
        
        Args:
            draw: PIL ImageDraw 객체
            text: 렌더링할 텍스트
            bbox: 바운딩 박스 [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
            max_size: 최대 폰트 크기
            min_size: 최소 폰트 크기
        
        Returns:
            (font, size): 최적 폰트 객체와 크기
        """
        # 박스 크기 계산
        x_coords = [pt[0] for pt in bbox]
        y_coords = [pt[1] for pt in bbox]
        bbox_width = max(x_coords) - min(x_coords)
        bbox_height = max(y_coords) - min(y_coords)
        
        # 폰트 크기를 줄여가며 맞는 크기 찾기
        for size in range(max_size, min_size - 1, -1):
            try:
                if self.font_path:
                    font = ImageFont.truetype(self.font_path, size)
                else:
                    font = ImageFont.load_default()
                
                # 텍스트 크기 측정
                text_bbox = draw.textbbox((0, 0), text, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
                
                # 박스의 90% 이내에 들어가면 OK
                if text_width <= bbox_width * 0.9 and text_height <= bbox_height * 0.9:
                    return font, size
            except:
                continue
        
        # 최소 크기로 폴백
        if self.font_path:
            return ImageFont.truetype(self.font_path, min_size), min_size
        else:
            return ImageFont.load_default(), min_size
    
    def render(self, image: np.ndarray, text_blocks: List[Dict], target_lang: str) -> np.ndarray:
        """
        번역된 텍스트를 이미지에 렌더링
        
        Args:
            image: 텍스트가 제거된 깨끗한 이미지
            text_blocks: OCR에서 추출한 텍스트 블록
            target_lang: 번역 목표 언어
        
        Returns:
            번역 텍스트가 렌더링된 최종 이미지
        """
        # Numpy -> PIL 변환
        img_pil = Image.fromarray(image)
        draw = ImageDraw.Draw(img_pil)
        
        translated_count = 0
        
        for block in text_blocks:
            # 원본 텍스트 및 번역
            original_text = block.get('text', '')
            if not original_text.strip():
                continue
                
            translated_text = self.translate_text(original_text, target_lang)
            if not translated_text:
                continue
            
            bbox = block['bbox']
            
            # 폰트 자동 조절
            font, size = self.auto_fit_font(draw, translated_text, bbox)
            
            # 색상 결정: 블록에 색상 정보가 없으면 배경색을 분석하여 대비색 사용 (간단히 검정색 유지 또는 보강 가능)
            # 여기서는 기본 검정색을 유지하되, 나중에 OCR이 색상을 제공하면 연동 가능하게 구조화
            render_color = block.get('color', self.default_color)
            
            # 렌더링 위치 계산 (박스 중앙 정렬 보정)
            x_min = min(pt[0] for pt in bbox)
            y_min = min(pt[1] for pt in bbox)
            x_max = max(pt[0] for pt in bbox)
            y_max = max(pt[1] for pt in bbox)
            
            # 수직/수평 중앙 정렬을 위한 오프셋 계산
            text_bbox_rendered = draw.textbbox((0, 0), translated_text, font=font)
            text_w = text_bbox_rendered[2] - text_bbox_rendered[0]
            text_h = text_bbox_rendered[3] - text_bbox_rendered[1]
            
            box_w = x_max - x_min
            box_h = y_max - y_min
            
            x_pos = x_min + max(0, (box_w - text_w) // 2)
            y_pos = y_min + max(0, (box_h - text_h) // 2)
            
            # 텍스트 그리기
            draw.text((x_pos, y_pos), translated_text, font=font, fill=render_color)
            translated_count += 1
        
        print(f"   ✓ Rendered {translated_count}/{len(text_blocks)} translated texts onto clean background")
        
        # PIL -> Numpy 변환
        return np.array(img_pil)
