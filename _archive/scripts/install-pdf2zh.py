#!/usr/bin/env python3
"""
📦 PDFMathTranslate (pdf2zh) 설치 스크립트

이 스크립트는 pdf2zh와 필요한 의존성을 자동으로 설치합니다.
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """명령어 실행 헬퍼"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ {description} 완료")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} 실패:")
        print(e.stderr)
        return False

def main():
    print("=" * 60)
    print("📄 PDFMathTranslate (pdf2zh) 설치 시작")
    print("=" * 60)

    # 1. pip 업그레이드
    if not run_command(
        f"{sys.executable} -m pip install --upgrade pip",
        "pip 업그레이드"
    ):
        return False

    # 2. pdf2zh 설치
    if not run_command(
        f"{sys.executable} -m pip install pdf2zh",
        "pdf2zh 설치"
    ):
        return False

    # 3. 추가 의존성 설치 (선택적)
    dependencies = [
        "torch",  # DocLayout-YOLO 모델용
        "torchvision",
        "transformers",  # LayoutXLM용
        "pillow",  # 이미지 처리
    ]

    print("\n🔧 추가 의존성 설치 중...")
    for dep in dependencies:
        run_command(
            f"{sys.executable} -m pip install {dep}",
            f"{dep} 설치"
        )

    # 4. 설치 확인
    print("\n" + "=" * 60)
    print("✅ 설치 완료! 버전 확인:")
    print("=" * 60)
    
    subprocess.run([sys.executable, "-m", "pip", "show", "pdf2zh"])

    print("\n🎉 pdf2zh 설치가 완료되었습니다!")
    print("📝 사용 예시:")
    print("   pdf2zh input.pdf -o output.pdf -l ko")

if __name__ == "__main__":
    main()
