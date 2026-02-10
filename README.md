# Fabricates Project

반도체 FAB(Fabrication) 환경과 개별 장비(Equipment) 작동을 3D로 시뮬레이션하는 웹 애플리케이션입니다.
React, Three.js (React Three Fiber), Zustand를 사용하여 개발되었습니다.

## 🚀 프로젝트 시작하기

### 설치 (Installation)
프로젝트 폴더에서 터미널을 열고 다음 명령어를 입력하여 필요한 라이브러리를 설치합니다.

```bash
npm install
```

### 실행 (Run)
개발 모드로 실행하려면 다음 명령어를 입력합니다.

```bash
npm run dev
```
브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)을 열어 확인합니다.

---

## 📂 프로젝트 구조

주요 파일과 폴더의 역할은 다음과 같습니다.

### `src/`
*   **`App.tsx`**: 메인 애플리케이션 파일입니다. 전체 레이아웃과 모드 전환(FAB/EQP), UI 오버레이를 관리합니다.
*   **`store/useStore.ts`**: 전역 상태 관리 파일입니다. 모드, 검색어, 장비 상태 등을 관리합니다.
*   **`components/layout/MainLayout.tsx`**: 웹 페이지의 기본 틀(헤더, 푸터)을 잡는 컴포넌트입니다.

### `src/components/3d/`
*   **`FabScene.tsx`**: **FAB 모드**에서 보이는 3D 씬입니다. 전체 공장 레이아웃과 장비들이 배치됩니다.
*   **`EqpScene.tsx`**: **EQP 모드**에서 보이는 3D 씬입니다. 개별 스핀 코터 장비의 동작을 시뮬레이션합니다.
*   **`EquipmentBox.tsx`**: FAB 모드에서 사용되는 개별 장비 블록 컴포넌트입니다.

### `src/data/`
*   **`fab_data.json`**: 장비들의 정보(위치, 크기, 이름 등)가 담긴 데이터 파일입니다.

---

## 🎮 주요 기능 및 조작법

### 1. FAB MODE (공장 전체 뷰)
*   **이동 (WASD)**: `W`, `A`, `S`, `D` 키 또는 화살표 키로 카메라를 이동합니다.
*   **상승/하강**: `Q`(위로), `E`(아래로) 키로 카메라 높이를 조절합니다.
*   **회전/줌**: 마우스 왼쪽 드래그(회전), 오른쪽 드래그(이동), 휠(줌)을 사용합니다.
*   **장비 검색**: 왼쪽 상단 검색창에 장비 이름(예: `EQP-A`)이나 공정(예: `Etch`)을 입력하고 Enter를 누르면 해당 장비로 카메라가 이동합니다.
*   **상세 정보**: 장비 위에 마우스를 올리면 오른쪽 상단에 상세 정보가 표시됩니다.

### 2. EQP MODE (장비 시뮬레이션)
*   **Spin Coater Control**: 오른쪽 컨트롤 패널을 사용하여 장비를 조작할 수 있습니다.
    *   **Arm 1 (Dispense)**: 약액 분사 암을 이동시킵니다. (`HOME` / `CENTER`)
    *   **Arm 2 (Cleaning)**: 세정 암을 이동시킵니다. (`HOME` / `CENTER`)
    *   **Chuck Rotation**: 웨이퍼를 회전시킵니다. (`SPIN` / `STOP`)

---

## 🛠️ 커스터마이징 가이드 (초보자용 Tip)

### Q. 장비 위치나 이름을 바꾸고 싶어요.
`src/data/fab_data.json` 파일을 열어 `position` (x, y, z 좌표), `size`, `name` 값을 수정하세요.

### Q. 카메라의 초기 위치를 변경하고 싶어요.
`src/components/3d/FabScene.tsx` 또는 `EqpScene.tsx` 파일 상단에 있는 `INITIAL_CAMERA_POSITION` 값을 배열 `[x, y, z]` 형태로 수정하세요.

### Q. 장비 색상을 바꾸고 싶어요.
`src/components/3d/EquipmentBox.tsx` 파일에서 `<meshStandardMaterial color={...} />` 부분을 찾아 원하는 색상 코드(예: `'#ff0000'`)로 변경하세요.
