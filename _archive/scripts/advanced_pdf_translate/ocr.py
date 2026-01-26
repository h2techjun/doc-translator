"""
Module 2: OCR with Bounding Boxes
Extract text and coordinates using PaddleOCR
"""

import numpy as np
from typing import List, Dict
import os
import sys

# PaddleOCR 임포트 (Python 3.13 환경용)
try:
    from paddleocr import PaddleOCR
    PADDLE_AVAILABLE = True
except ImportError:
    PADDLE_AVAILABLE = False


class TextExtractor:
    """
    PaddleOCR 기반 텍스트 추출기
    
    특징:
        - Python 3.13 환경에서 고정밀 OCR 지원
        - 한글, 영어, 중국어, 일본어 등 다국어 인식률 우수
        - 레이아웃 보존을 위한 정밀한 바운딩 박스 제공
    """
    
    def __init__(self, lang: str = 'korean', use_gpu: bool = False):
        """
        Args:
            lang: OCR 언어 ( 기본값: korean)
            use_gpu: GPU 사용 여부 (기본값: False)
        """
        if not PADDLE_AVAILABLE:
            print("   ❌ PaddleOCR is not installed. Please install it with 'pip install paddleocr paddlepaddle'")
            self.reader = None
            return

        # PaddleOCR 언어 코드 매핑
        # ko: korean, en: english, ch: chinese_sim, japan: japanese
        lang_map = {
            'korean': 'korean',
            'ko': 'korean',
            'en': 'en',
            'english': 'en',
            'ch': 'ch',
            'chinese': 'ch',
            'japan': 'japan',
            'ja': 'japan'
        }
        
        self.ocr_lang = lang_map.get(lang.lower(), 'en')
        self.use_gpu = use_gpu
        
        print(f"   🔧 Initializing PaddleOCR 2.x (lang={self.ocr_lang})...")
        try:
            # 환경 변수 설정
            import os
            os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'
            
            # PaddleOCR 클래식 초기화
            from paddleocr import PaddleOCR
            
            self.reader = PaddleOCR(
                lang=self.ocr_lang,
                use_angle_cls=True,
                use_gpu=False,
                show_log=False
            )
            print("   ✓ PaddleOCR 2.x initialized successfully")
        except Exception as e:
            print(f"   ❌ Error initializing PaddleOCR: {e}")
            self.reader = None
    
    def extract(self, image: np.ndarray) -> List[Dict]:
        """
        이미지에서 텍스트와 바운딩 박스 추출
        """
        if self.reader is None:
            return []

        print(f"   🔍 OCR Engine starting (PaddleOCR 2.x)...")
        try:
            # PaddleOCR 2.x의 클래식 호출 방식
            # result structure: [ [ [bbox, [text, confidence]], ... ], ... ]
            results = self.reader.ocr(image, cls=True)

            if not results or results[0] is None:
                return []
            
            text_blocks = []
            
            # PaddleOCR 2.x 결과 파싱
            for line in results[0]:
                bbox = line[0]     # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                text_info = line[1] # ('text', confidence)
                
                text = text_info[0]
                confidence = float(text_info[1])
                
                # 마스킹 누락을 방지하기 위해 임계값을 더 낮춤 (기본 0.5 -> 0.3)
                if confidence < 0.3:
                    continue

                text_blocks.append({
                    'text': text,
                    'bbox': [[float(p[0]), float(p[1])] for p in bbox],
                    'confidence': confidence
                })
            
            print(f"   ✓ Extracted {len(text_blocks)} text blocks")
            if text_blocks:
                 for i, b in enumerate(text_blocks[:5]): # 상위 5개만 로깅
                     print(f"     [{i+1}] '{b['text'][:20]}' (conf: {b['confidence']:.2f})")
                 if len(text_blocks) > 5: print(f"     ... and {len(text_blocks)-5} more")

            return text_blocks
        except Exception as e:
            print(f"   ❌ OCR extraction failed: {e}")
            return []


def detect_language(text_sample: str) -> str:
    """
    텍스트 샘플로부터 언어 감지
    """
    if not text_sample:
        return 'en'
        
    korean_count = sum(1 for c in text_sample if '\uAC00' <= c <= '\uD7A3')
    
    if len(text_sample) > 0 and (korean_count / len(text_sample)) > 0.1:
        return 'korean'
    return 'en'


if __name__ == "__main__":
    # 단순 테스트 코드
    import cv2
    extractor = TextExtractor(lang='korean')
    # dummy white image
    img = np.ones((100, 300, 3), dtype=np.uint8) * 255
    cv2.putText(img, "안녕하세요 PaddleOCR 테스트", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)
    res = extractor.extract(img)
    print(res)
