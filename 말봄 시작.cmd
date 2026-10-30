@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 말봄을 시작합니다. 브라우저에서 http://localhost:4173 을 열어 주세요.
echo 이 창을 닫으면 서버가 종료됩니다.
node scripts/preview.mjs
pause
