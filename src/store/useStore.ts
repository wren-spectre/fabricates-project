import { create } from 'zustand'
import type { EquipmentData } from '../types'

// 애플리케이션의 모드 정의 (FAB: 공장 전체 뷰, EQP: 개별 장비 시뮬레이션)
export type AppMode = 'FAB' | 'EQP'

// 전역 상태(Global State) 인터페이스 정의
// 애플리케이션 전반에서 공유되는 데이터의 타입을 여기서 정의합니다.
interface AppState {
    // --- 기본 상태 ---
    mode: AppMode // 현재 활성화된 모드 (FAB 또는 EQP)
    searchText: string // 검색창에 입력된 텍스트
    isSearchFocused: boolean // 검색창에 포커스가 있는지 여부 (키보드 이벤트 제어용)

    // --- EQP 모드 관련 상태 ---
    nozzleHeight: number // (미사용) 노즐 높이
    isSpinning: boolean // 스핀 코터(Spin Coater) 회전 여부
    arm1Target: 'HOME' | 'CENTER' // Arm 1 (Dispense)의 목표 위치 (HOME: 대기, CENTER: 작업)
    arm2Target: 'HOME' | 'CENTER' // Arm 2 (Cleaning)의 목표 위치

    // --- 카메라/인터랙션 관련 상태 ---
    isCameraMoved: boolean // 카메라가 초기 위치에서 이동했는지 여부 (Reset 버튼 표시용)
    resetCameraTrigger: number // 카메라 리셋을 트리거하는 카운터 (값이 변경되면 리셋 실행)
    hoveredEquipment: EquipmentData | null // 마우스가 올라간 장비 데이터 (툴팁 표시용)
    highlightedEquipmentIds: string[] // 검색 결과 등으로 강조된 장비 ID 목록

    // --- 상태 변경 함수 (Actions) ---
    // 상태를 업데이트하는 함수들입니다.
    setMode: (mode: AppMode) => void // 모드 변경
    setSearchText: (text: string) => void // 검색어 설정
    setNozzleHeight: (height: number) => void // (미사용) 노즐 높이 설정
    setIsSpinning: (spinning: boolean) => void // 회전 상태 설정
    setArm1Target: (target: 'HOME' | 'CENTER') => void // Arm 1 위치 설정
    setArm2Target: (target: 'HOME' | 'CENTER') => void // Arm 2 위치 설정
    setSearchFocused: (focused: boolean) => void // 검색창 포커스 설정
    setIsCameraMoved: (moved: boolean) => void // 카메라 이동 상태 설정
    triggerResetCamera: () => void // 카메라 리셋 트리거 발생 (카운터 증가)
    setHoveredEquipment: (eq: EquipmentData | null) => void // 호버된 장비 설정
    setHighlightedEquipmentIds: (ids: string[]) => void // 강조할 장비 ID 설정
}

// Zustand 스토어 생성
// 컴포넌트 어디서든 useStore()를 통해 이 상태와 함수들에 접근할 수 있습니다.
export const useStore = create<AppState>((set) => ({
    // 초기 상태 값 설정
    mode: 'FAB', // 기본 모드는 FAB
    searchText: '',
    nozzleHeight: 0,
    isSpinning: false, // 기본적으로 회전하지 않음
    arm1Target: 'HOME', // Arm은 기본적으로 HOME 위치
    arm2Target: 'HOME',
    isSearchFocused: false,
    isCameraMoved: false,
    resetCameraTrigger: 0,
    hoveredEquipment: null,
    highlightedEquipmentIds: [],

    // 상태 업데이트 함수 구현
    // set 함수를 사용하여 상태를 불변성을 유지하며 업데이트합니다.
    setMode: (mode) => set({ mode }),
    setSearchText: (text) => set({ searchText: text }),
    setNozzleHeight: (h) => set({ nozzleHeight: h }),
    setIsSpinning: (s) => set({ isSpinning: s }),
    setArm1Target: (t) => set({ arm1Target: t }),
    setArm2Target: (t) => set({ arm2Target: t }),
    setSearchFocused: (f) => set({ isSearchFocused: f }),
    setIsCameraMoved: (m) => set({ isCameraMoved: m }),
    // triggerResetCamera는 호출될 때마다 값을 1씩 증가시켜 useEffect가 감지하게 합니다.
    triggerResetCamera: () => set((state) => ({ resetCameraTrigger: state.resetCameraTrigger + 1 })),
    setHoveredEquipment: (eq) => set({ hoveredEquipment: eq }),
    setHighlightedEquipmentIds: (ids) => set({ highlightedEquipmentIds: ids }),
}))
