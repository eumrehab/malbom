@echo off
chcp 65001 >nul
cd /d "%~dp0"
node scripts/prepare-pages.cjs
if errorlevel 1 (
 echo 배포 파일 준비에 실패했습니다. 표시된 오류를 확인해 주세요.
) else (
 echo GitHub Desktop에서 변경 내용을 Commit한 뒤 Push origin을 누르면 됩니다.
)
pause
