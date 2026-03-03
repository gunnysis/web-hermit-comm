#!/usr/bin/env bash
# sync-from-app.sh — 중앙 Supabase 프로젝트에서 마이그레이션을 이 웹 레포로 동기화
#
# 사용법:
#   bash scripts/sync-from-app.sh          # 동기화
#   bash scripts/sync-from-app.sh --dry    # 변경 없이 확인만
#
# 전제 조건:
#   - 중앙 Supabase 프로젝트: ~/apps/supabase-hermit
#   - 앱 타입 참조: /mnt/c/Users/Administrator/programming/apps/gns-hermit-comm

set -euo pipefail

CENTRAL="/home/gunny/apps/supabase-hermit"
APP_REPO="/mnt/c/Users/Administrator/programming/apps/gns-hermit-comm"
WEB_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DRY_RUN=false
[[ "${1:-}" == "--dry" ]] && DRY_RUN=true

echo "=== 은둔마을 Supabase → 웹 동기화 ==="
echo "중앙: $CENTRAL/supabase/migrations"
echo "웹:   $WEB_REPO/supabase/migrations"
$DRY_RUN && echo "🔍 DRY RUN 모드"
echo ""

# 중앙 프로젝트 존재 확인
if [ ! -d "$CENTRAL/supabase/migrations" ]; then
  echo "❌ 중앙 Supabase 프로젝트를 찾을 수 없습니다: $CENTRAL"
  echo "   ~/apps/supabase-hermit 을 먼저 설정하세요."
  exit 1
fi

# 1. 마이그레이션 동기화
echo "--- [1/3] 마이그레이션 동기화 (중앙 → 웹) ---"
CENTRAL_MIGRATIONS="$CENTRAL/supabase/migrations"
WEB_MIGRATIONS="$WEB_REPO/supabase/migrations"
mkdir -p "$WEB_MIGRATIONS"

ADDED=0
UPDATED=0
for file in "$CENTRAL_MIGRATIONS"/*.sql; do
  filename="$(basename "$file")"
  dest="$WEB_MIGRATIONS/$filename"
  if [ ! -f "$dest" ]; then
    echo "  ➕ 추가: $filename"
    $DRY_RUN || cp "$file" "$dest"
    ADDED=$((ADDED + 1))
  elif ! diff -q "$file" "$dest" > /dev/null 2>&1; then
    echo "  🔄 갱신: $filename (중앙 기준)"
    $DRY_RUN || cp "$file" "$dest"
    UPDATED=$((UPDATED + 1))
  fi
done

# 웹에만 있는 파일 경고
for file in "$WEB_MIGRATIONS"/*.sql; do
  [ -f "$file" ] || continue
  filename="$(basename "$file")"
  if [ ! -f "$CENTRAL_MIGRATIONS/$filename" ]; then
    echo "  🚨 중앙에 없는 migration: $filename"
    echo "     → 중앙 프로젝트(~/apps/supabase-hermit)에 먼저 추가하세요"
  fi
done

echo "  결과: $ADDED 추가, $UPDATED 갱신"

# 2. 타입 차이 알림
echo ""
echo "--- [2/3] 타입 변경 사항 확인 ---"
APP_TYPES="$APP_REPO/src/types/index.ts"
WEB_TYPES="$WEB_REPO/src/types/database.ts"

if [ ! -f "$WEB_TYPES" ]; then
  echo "  ⚠️  웹 타입 파일 없음: $WEB_TYPES"
elif [ ! -f "$APP_TYPES" ]; then
  echo "  ⚠️  앱 타입 파일 없음: $APP_TYPES"
else
  APP_TYPES_LIST=$(grep -oP '(?<=export (type|interface) )\w+' "$APP_TYPES" 2>/dev/null | sort || true)
  WEB_TYPES_LIST=$(grep -oP '(?<=export (type|interface) )\w+' "$WEB_TYPES" 2>/dev/null | sort || true)
  MISSING_IN_WEB=$(comm -23 <(echo "$APP_TYPES_LIST") <(echo "$WEB_TYPES_LIST") || true)
  if [ -n "$MISSING_IN_WEB" ]; then
    echo "  ⚠️  앱에 있지만 웹에 없는 타입:"
    echo "$MISSING_IN_WEB" | while read -r t; do echo "    - $t"; done
  else
    echo "  ✅ 타입 목록 일치"
  fi
fi

# 3. 일관성 체크
echo ""
echo "--- [3/3] 일관성 검증 ---"
CENTRAL_COUNT=$(ls -1 "$CENTRAL_MIGRATIONS"/*.sql 2>/dev/null | wc -l)
WEB_COUNT=$(ls -1 "$WEB_MIGRATIONS"/*.sql 2>/dev/null | wc -l)
if [ "$CENTRAL_COUNT" -eq "$WEB_COUNT" ]; then
  echo "  ✅ 마이그레이션 파일 수 일치 ($CENTRAL_COUNT개)"
else
  echo "  ⚠️  중앙: ${CENTRAL_COUNT}개, 웹: ${WEB_COUNT}개"
fi

echo ""
echo "=== 동기화 완료 ==="
