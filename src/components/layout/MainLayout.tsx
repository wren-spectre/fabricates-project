import React from 'react'
import { useStore } from '../../store/useStore'

// 메인 레이아웃 컴포넌트의 Props 타입 정의
interface MainLayoutProps {
    children: React.ReactNode // 레이아웃 안에 들어갈 자식 컴포넌트들 (주로 3D Canvas 등)
}

/**
 * MainLayout 컴포넌트
 * 애플리케이션의 전체적인 틀을 잡는 컴포넌트입니다.
 * 상단 헤더(Header), 중앙 컨텐츠(Main), 하단 푸터(Footer) 영역을 관리합니다.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    // 전역 상태 스토어에서 mode와 setMode를 가져옵니다.
    const { mode, setMode } = useStore()

    return (
        // 전체 화면 레이아웃 컨테이너 (h-screen: 화면 높이 100%)
        <div className="w-full h-screen bg-black text-white flex flex-col font-sans">

            {/* --- 1. 헤더 (Header) 영역 --- */}
            {/* 로고와 모드 전환 버튼이 위치합니다. */}
            <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
                {/* 로고 텍스트 */}
                <div className="text-xl font-bold tracking-tight">FABRICATES</div>

                {/* 모드 전환 버튼 그룹 (FAB MODE <-> EQP MODE) */}
                <div className="flex bg-gray-900 rounded-lg p-1">
                    {/* FAB 모드 버튼 */}
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'FAB'
                            ? 'bg-white text-black shadow-sm' // 활성화 스타일
                            : 'text-gray-400 hover:text-white' // 비활성화 스타일
                            }`}
                        onClick={() => setMode('FAB')} // 클릭 시 FAB 모드로 변경
                    >
                        FAB MODE
                    </button>
                    {/* EQP 모드 버튼 */}
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'EQP'
                            ? 'bg-white text-black shadow-sm' // 활성화 스타일
                            : 'text-gray-400 hover:text-white' // 비활성화 스타일
                            }`}
                        onClick={() => setMode('EQP')} // 클릭 시 EQP 모드로 변경
                    >
                        EQP MODE
                    </button>
                </div>

                <div className="w-20"></div> {/* 좌우 균형을 맞추기 위한 빈 공간 (Spacer) */}
            </header>

            {/* --- 2. 메인 컨텐츠 (Main) 영역 --- */}
            {/* 3D 캔버스 등이 렌더링되는 핵심 영역입니다. */}
            <main className="flex-1 relative overflow-hidden">
                {children} {/* 자식 컴포넌트들이 여기에 표시됩니다. */}

                {/* 카메라 리셋 버튼 (Footer Overlay) */}
                {/* 카메라가 이동했을 때만(isCameraMoved가 true일 때) 왼쪽 하단에 나타납니다. */}
                <div className="absolute bottom-6 left-6 pointer-events-none">
                    <button
                        className={`pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/90 border border-gray-700 
                        backdrop-blur-md rounded-lg text-sm font-medium text-white transition-all duration-300 hover:bg-gray-800
                        ${useStore.getState().isCameraMoved // 카메라 이동 여부에 따라 보임/숨김 처리
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={() => useStore.getState().triggerResetCamera()} // 클릭 시 카메라 리셋 트리거
                    >
                        {/* 리셋 아이콘 (SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        Reset Camera
                    </button>
                </div>
            </main>

            {/* --- 3. 푸터 (Footer) 상태 바 --- */}
            {/* 하단 중앙에 저작권 정보를 표시합니다. */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500/50 pointer-events-none select-none">
                <div className="flex gap-4">
                    <span>Fabricates Project ⓒ eden02 lab. All rights reserved.</span>
                </div>
            </div>
        </div>
    )
}
