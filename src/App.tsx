import React from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { useStore } from './store/useStore'
import { FabScene } from './components/3d/FabScene'
import { EqpScene } from './components/3d/EqpScene'
import fabData from './data/fab_data.json'

function App() {
    // 전역 상태 가져오기
    const mode = useStore((state) => state.mode) // 현재 모드 (FAB / EQP)
    const searchText = useStore((state) => state.searchText) // 검색어
    const hoveredEquipment = useStore((state) => state.hoveredEquipment) // 마우스 오버된 장비

    // 유효하지 않은 검색어인지 확인 (검색어가 있는데 데이터에 없는 경우)
    const isInvalidSearch = searchText !== '' && !fabData.some(eq =>
        eq.name.toLowerCase() === searchText.toLowerCase() ||
        eq.process.toLowerCase() === searchText.toLowerCase()
    )

    // 로컬 상태: 도움말 패널 표시 여부
    const [showHelp, setShowHelp] = React.useState(false)

    // 키보드 컨트롤 매핑 설정 (이름: [키 목록])
    // 여기서 정의한 이름(forward, backward 등)을 하위 컴포넌트에서 useKeyboardControls()로 사용합니다.
    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
        { name: 'up', keys: ['q', 'Q'] }, // 상승
        { name: 'down', keys: ['e', 'E'] }, // 하강
    ]

    return (
        <MainLayout>
            {/* 3D 캔버스 컨테이너 */}
            <div className="w-full h-full relative">
                {/* React Three Fiber Canvas: 3D 렌더링의 진입점 */}
                <Canvas>
                    {/* KeyboardControls Provider: 하위 모든 컴포넌트에서 키보드 입력을 감지할 수 있게 함 */}
                    <KeyboardControls map={keyboardMap}>

                        {/* 배경색 설정 */}
                        <color attach="background" args={['#000000']} />

                        {/* 기본 조명 설정 */}
                        <ambientLight intensity={0.5} /> {/* 전체적으로 은은한 빛 */}
                        <pointLight position={[10, 10, 10]} /> {/* 특정 지점의 광원 */}

                        {/* 모드에 따른 씬 전환 */}
                        {mode === 'FAB' ? (
                            <FabScene /> // FAB 전체 뷰
                        ) : (
                            <EqpScene /> // 장비 상세 뷰
                        )}
                    </KeyboardControls>
                </Canvas>

                {/* --- UI 오버레이 (2D UI) --- */}
                {/* 왼쪽 상단: 모드 정보 및 검색창 */}
                <div className="absolute top-4 left-4 p-4 bg-black/50 backdrop-blur-md rounded-lg border border-gray-800 pointer-events-auto">
                    <h2 className="text-lg font-bold mb-1">{mode} MODE</h2>
                    <p className="text-sm text-gray-400 mb-3">
                        {mode === 'FAB' ? 'Navigate layout using mouse' : 'Simulate equipment operation'}
                    </p>

                    {/* FAB 모드일 때만 검색창 표시 */}
                    {mode === 'FAB' && (
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    placeholder="search eqp/prc here"
                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white w-50 h-8 pr-6"

                                    // 입력 값 변경 시 처리
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (val === '') {
                                            // 검색어 지우면 초기화
                                            useStore.getState().setSearchText('')
                                            useStore.getState().setHighlightedEquipmentIds([])
                                        }
                                    }}

                                    // 엔터 키 입력 시 검색 실행
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value
                                            useStore.getState().setSearchText(val)

                                            // 이름이나 공정명(Process)이 일치하는 장비 찾기
                                            const matches = fabData.filter(eq =>
                                                eq.name.toLowerCase() === val.toLowerCase() ||
                                                eq.process.toLowerCase() === val.toLowerCase()
                                            ).map(eq => eq.id)

                                            // 찾은 장비들을 강조 상태로 설정 (카메라 이동 트리거)
                                            useStore.getState().setHighlightedEquipmentIds(matches)
                                        }
                                    }}

                                    // 검색창 포커스 시 키보드 이동 방지 등을 위해 상태 설정
                                    onFocus={() => useStore.getState().setSearchFocused(true)}
                                    // 포커스 해제
                                    onBlur={() => useStore.getState().setSearchFocused(false)}
                                />
                                {/* 검색어 초기화 (X) 버튼 */}
                                <button
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                        if (input) {
                                            input.value = ''
                                            useStore.getState().setSearchText('')
                                            useStore.getState().setHighlightedEquipmentIds([])
                                            input.focus()
                                        }
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 검색 실패 시 에러 메시지 표시 */}
                            <div className={`mt-1 w-full pointer-events-none ${isInvalidSearch ? '' : 'invisible'}`}>
                                <p className="text-red-500 text-xs font-bold drop-shadow-md whitespace-nowrap">
                                    Input correct equipment name
                                </p>
                            </div>
                        </div>

                    )}
                </div>

                {/* --- 도움말 패널 (Help Panel) --- */}
                {showHelp && (
                    <div className="absolute bottom-20 right-4 w-80 bg-black/90 backdrop-blur-md border border-gray-700 rounded-lg p-6 pointer-events-auto shadow-xl font-sans text-gray-300">
                        <h3 className="text-white font-bold text-lg mb-4">{mode} Controls</h3>

                        <div className="space-y-6">
                            {/* 키보드 조작법 */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase">Keyboard</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1 w-36">
                                            <div className="flex gap-1">
                                                <span className="w-8 h-8 border border-gray-500 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">W</span>
                                                <span className="w-8 h-8 border border-gray-500 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">A</span>
                                                <span className="w-8 h-8 border border-gray-500 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">S</span>
                                                <span className="w-8 h-8 border border-gray-500 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">D</span>
                                            </div>
                                        </div>
                                        <span>: Move</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1 w-36">
                                            <span className="w-8 h-8 border border-gray-500 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">Q</span>
                                            <span className="w-8 h-8 border border-gray-500 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white">E</span>
                                        </div>
                                        <span>: Up/Down</span>
                                    </div>
                                </div>
                            </div>

                            {/* 마우스 조작법 */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase">Mouse</h4>
                                <div className="pl-1 space-y-2 text-sm">
                                    <div className="flex gap-2 items-center">
                                        <span className="w-36 text-gray-400">Left Drag</span>
                                        <span>: Rotate</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="w-36 text-gray-400">Right Drag</span>
                                        <span>: Pan</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="w-36 text-gray-400">Scroll</span>
                                        <span>: Zoom</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 도움말 토글 버튼 (?) */}
                <div className="absolute bottom-4 right-4 pointer-events-auto">
                    <button
                        className="w-10 h-10 rounded-full bg-black/50 border border-gray-600 text-white hover:bg-gray-800 transition-colors flex items-center justify-center font-bold text-lg"
                        onClick={() => setShowHelp(!showHelp)}
                    >
                        {showHelp ? 'X' : '?'}
                    </button>
                </div>

                {/* FAB Mode: 장비 정보 툴팁 (우측 상단) */}
                {mode === 'FAB' && hoveredEquipment && (
                    <div className="absolute top-4 right-4 p-4 bg-black/50 border border-gray-700 rounded-lg backdrop-blur-md pointer-events-none w-64">
                        <h3 className="text-lg font-bold text-white mb-1">{hoveredEquipment.name}</h3>
                        <p className="text-sm text-cyan-400 font-mono mb-2">{hoveredEquipment.process}</p>
                        <div className="border-t border-gray-800 pt-2">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {hoveredEquipment.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* EQP Mode: 장비 제어 패널 (우측 상단) */}
                {mode === 'EQP' && (
                    <div className="absolute top-20 right-4 w-64 bg-gray-900/90 border border-gray-700 rounded-lg p-4 backdrop-blur-md pointer-events-auto">
                        <h3 className="text-md font-bold text-white mb-3">Spin Coater Control</h3>

                        <div className="space-y-4">
                            {/* Arm 1 Control (Dispense) */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Arm 1 (Dispense)</label>
                                <div className="flex gap-2">
                                    {/* HOME 버튼 */}
                                    <button
                                        className={`flex-1 text-xs py-2 rounded transition-colors ${useStore.getState().arm1Target === 'HOME'
                                            ? 'bg-gray-600 text-white font-bold ring-1 ring-gray-400'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                        onClick={() => useStore.getState().setArm1Target('HOME')}
                                    >
                                        HOME
                                    </button>
                                    {/* CENTER 버튼 */}
                                    <button
                                        className={`flex-1 text-xs py-2 rounded transition-colors ${useStore.getState().arm1Target === 'CENTER'
                                            ? 'bg-cyan-800 text-white font-bold ring-1 ring-cyan-400'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                        onClick={() => useStore.getState().setArm1Target('CENTER')}
                                    >
                                        CENTER
                                    </button>
                                </div>
                            </div>

                            {/* Arm 2 Control (Cleaning) */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Arm 2 (Cleaning)</label>
                                <div className="flex gap-2">
                                    <button
                                        className={`flex-1 text-xs py-2 rounded transition-colors ${useStore.getState().arm2Target === 'HOME'
                                            ? 'bg-gray-600 text-white font-bold ring-1 ring-gray-400'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                        onClick={() => useStore.getState().setArm2Target('HOME')}
                                    >
                                        HOME
                                    </button>
                                    <button
                                        className={`flex-1 text-xs py-2 rounded transition-colors ${useStore.getState().arm2Target === 'CENTER'
                                            ? 'bg-purple-800 text-white font-bold ring-1 ring-purple-400'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                        onClick={() => useStore.getState().setArm2Target('CENTER')}
                                    >
                                        CENTER
                                    </button>
                                </div>
                            </div>

                            {/* Spin Control (회전 제어) */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Chuck Rotation</label>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded transition-colors"
                                        onClick={() => useStore.getState().setIsSpinning(false)}
                                    >
                                        STOP
                                    </button>
                                    <button
                                        className="flex-1 bg-green-900 hover:bg-green-800 text-white text-xs py-2 rounded transition-colors border border-green-700"
                                        onClick={() => useStore.getState().setIsSpinning(true)}
                                    >
                                        SPIN
                                    </button>
                                </div>
                            </div>

                            {/* 시스템 상태 표시 (장식용) */}
                            <div className="pt-2 border-t border-gray-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">System Status</span>
                                    <span className="text-xs text-green-400 font-mono">ONLINE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}

export default App
