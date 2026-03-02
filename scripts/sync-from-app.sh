#!/usr/bin/env bash
# sync-from-app.sh — 앱 레포에서 마이그레이션·타입을 이 웹 레포로 동기화
#
# 사용법:
#   bash scripts/sync-from-app.sh
#
# 전제 조건:
#   - WSL 환경에서 실행
#   - 앱 레포가 /mnt/c/Users/Administrator/programming/apps/gns-hermit-comm 에 위치

set -euo pipefail

APP_REPO="/mnt/c/Users/Administrator/programming/apps/gns-hermit-comm"
WEB_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== 은둔마을 앱 → 웹 동기화 ==="
echo "앱 레포: $APP_REPO"
echo "웹 레포: $WEB_REPO"
echo ""

# 앱 레포 존재 확인
if [ ! -d "$APP_REPO" ]; then
  echo "❌ 앱 레포를 찾을 수 없습니다: $APP_REPO"
  exit 1
fi

# 1. 마이그레이션 동기화
echo "--- [1/2] 마이그레이션 동기화 ---"
APP_MIGRATIONS="$APP_REPO/supabase/migrations"
WEB_MIGRATIONS="$WEB_REPO/supabase/migrations"

mkdir -p "$WEB_MIGRATIONS"

NEW_FILES=0
for file in "$APP_MIGRATIONS"/*.sql; do
  filename="$(basename "$file")"
  dest="$WEB_MIGRATIONS/$filename"
  if [ ! -f "$dest" ]; then
    cp "$file" "$dest"
    echo "  ✅ 복사: $filename"
    NEW_FILES=$((NEW_FILES + 1))
  fi
done

if [ "$NEW_FILES" -eq 0 ]; then
  echo "  (새 마이그레이션 없음)"
else
  echo "  총 $NEW_FILES 개 파일 복사됨"
fi

# 2. 타입 차이 알림
echo ""
echo "--- [2/2] 타입 변경 사항 확인 ---"
APP_TYPES="$APP_REPO/src/types/index.ts"
WEB_TYPES="$WEB_REPO/src/types/database.ts"

if [ ! -f "$WEB_TYPES" ]; then
  echo "  ⚠️  웹 타입 파일이 없습니다: $WEB_TYPES"
  echo "  앱 타입을 참고해 수동으로 생성하세요: $APP_TYPES"
else
  # 간단한 diff (타입 이름만 비교)
  APP_TYPES_LIST=$(grep -oP '(?<=export (type|interface) )\w+' "$APP_TYPES" 2>/dev/null | sort || true)
  WEB_TYPES_LIST=$(grep -oP '(?<=export (type|interface) )\w+' "$WEB_TYPES" 2>/dev/null | sort || true)

  MISSING_IN_WEB=$(comm -23 <(echo "$APP_TYPES_LIST") <(echo "$WEB_TYPES_LIST") || true)
  if [ -n "$MISSING_IN_WEB" ]; then
    echo "  ⚠️  앱에는 있지만 웹 타입에 없는 타입:"
    echo "$MISSING_IN_WEB" | while read -r t; do echo "    - $t"; done
    echo "  → 수동으로 $WEB_TYPES 를 업데이트하세요."
  else
    echo "  ✅ 타입 목록 일치 (내용은 수동 확인 필요)"
  fi
fi

echo ""
echo "=== 동기화 완료 ==="
echo "다음 단계:"
echo "  1. supabase/migrations/ 변경 사항 확인"
echo "  2. 새 테이블/컬럼이 있으면 src/types/database.ts 업데이트"
echo "  3. RLS 변경이 있으면 웹 쿼리 로직 확인"
