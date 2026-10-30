# GitHub Desktop으로 말봄 배포하기

환자가 여는 웹 화면은 GitHub Pages, 이름·비밀번호 확인과 결과 저장은 기존 Google Sheets + Apps Script를 사용합니다.

## 처음 배포

1. GitHub Desktop에서 **File → Add local repository**로 이 말봄 폴더를 추가합니다.
2. 변경 사항을 Commit하고 **Publish repository**로 GitHub에 올립니다.
3. GitHub 저장소에서 **Settings → Pages**로 이동합니다.
4. **Source: Deploy from a branch**, **Branch: main**, **Folder: /docs**를 선택하고 저장합니다.
5. Pages 화면에서 배포 완료 후 표시되는 사이트 주소를 환자에게 안내합니다.

GitHub 무료 계정으로 Pages를 이용할 경우 공개 저장소가 필요할 수 있습니다. 공개 저장소에서는 앱 소스를 볼 수 있습니다. 환자 명단, 비밀번호 검증값, 훈련 결과는 코드에 들어 있지 않으며 기존 비공개 Google 시트에서 관리합니다.

## 수정 후 다시 배포

1. **배포 준비.cmd**를 실행합니다. 수정된 웹 파일이 `docs`에 복사됩니다.
2. GitHub Desktop에서 변경 내용을 확인하고 **Commit to main**을 누릅니다.
3. **Push origin**을 누릅니다. GitHub Pages가 갱신됩니다.

`docs` 폴더는 배포용 복사본입니다. 화면 수정은 `dist`에서 진행하고 배포 준비를 다시 실행합니다. `dist`만 수정하고 `docs`를 갱신하지 않으면 사이트에는 반영되지 않습니다.

원문 PDF, 임시 미리보기, 캡처, 로그인 명단이나 결과 자료는 배포 폴더에 복사하지 않습니다. Google 시트 공유 범위를 공개로 바꾸지 않습니다.

Apps Script 코드를 수정한 경우에는 Google Apps Script에서 기존 배포의 새 버전으로 별도 갱신해야 합니다. 시트에서 사용자와 연습 분량만 바꾸는 경우에는 GitHub나 Apps Script를 다시 배포하지 않아도 됩니다.
