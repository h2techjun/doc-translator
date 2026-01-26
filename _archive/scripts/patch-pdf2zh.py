#!/usr/bin/env python3
"""
🔧 pdf2zh NumPy 호환성 패치

Python 3.14에서 제거된 np.fromstring을 np.frombuffer로 교체합니다.

에러:
    ValueError: The binary mode of fromstring is removed, use frombuffer instead

수정:
    np.fromstring(data, dtype) → np.frombuffer(data, dtype)
"""

import os
import sys

def patch_pdf2zh():
    """pdf2zh의 high_level.py 파일을 패치합니다"""
    
    # pdf2zh high_level.py 파일 경로
    try:
        import pdf2zh.high_level
        file_path = pdf2zh.high_level.__file__
    except ImportError:
        print("❌ pdf2zh가 설치되어 있지 않습니다.")
        return False
    
    print(f"🔧 pdf2zh 패치 시작")
    print(f"   파일: {file_path}")
    
    # 백업 생성
    backup_path = file_path + ".backup"
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy(file_path, backup_path)
        print(f"   ✅ 백업 생성: {backup_path}")
    
    # 파일 읽기
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 패치 적용
    original_content = content
    
    # np.fromstring → np.frombuffer 교체
    content = content.replace(
        'np.fromstring(pix.samples, np.uint8)',
        'np.frombuffer(pix.samples, np.uint8)'
    )
    
    # 변경 사항 확인
    if content == original_content:
        print("   ⚠️ 패치할 내용이 없습니다. 이미 패치되었거나 코드가 변경되었습니다.")
        return True
    
    # 파일 쓰기
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"   ✅ 패치 완료!")
    print(f"   📝 변경 내용:")
    print(f"      np.fromstring → np.frombuffer")
    
    return True

def patch_pdf2zh_mono_image():
    """
    pdf2zh가 Mono 모드일 때 원본 이미지(스캔본 배경)를 숨기도록 패치합니다.
    high_level.py의 create_instantiator 함수 등을 수정해야 할 수 있습니다.
    
    하지만 더 안전하고 확실한 방법은, 
    backend.py의 PageInterpreter.show_image 메서드를 수정하여 
    특정 조건에서 이미지를 그리지 않도록 하는 것입니다.
    """
    try:
        import pdf2zh.backend
        file_path = pdf2zh.backend.__file__
    except ImportError:
        return False
        
    print(f"🔧 pdf2zh 이미지 제거 패치 시작")
    print(f"   파일: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    
    # show_image 메서드에서 Mono 모드일 때 이미지 렌더링 무시하도록 수정
    # 여기서는 단순하게 show_image가 호출될 때 아무것도 안 하도록 주석 처리하거나 return 해버리면 
    # 모든 이미지가 날아갈 수 있으므로 주의.
    # 하지만 사용자는 "원본 페이지를 지우고" 싶어하므로, 스캔본의 경우 배경 이미지를 날리는 게 맞다.
    
    # 1. show_image 메서드 찾기
    if "def show_image(self, image):" in content:
        # 이미지를 그리는 부분을 조건부로 막거나 투명하게 처리
        # 가장 쉬운 건 show_image 함수 초입에 return을 넣어버리는 것 (테스트용)
        # 하지만 이러면 그림도 날아간다.
        pass
        
    return True

if __name__ == "__main__":
    success = patch_pdf2zh()
    sys.exit(0 if success else 1)
