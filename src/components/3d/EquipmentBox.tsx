import React, { useState } from 'react'
import type { EquipmentData } from '../../types'
import { useStore } from '../../store/useStore'

// 개별 장비(EquipmentBox) 컴포넌트의 Props
interface EquipmentBoxProps {
    data: EquipmentData // 장비 데이터 (위치, 크기, 이름 등)
}

/**
 * EquipmentBox 컴포넌트
 * 3D 씬 내에서 각 장비를 육면체(Box) 형태로 렌더링하는 컴포넌트입니다.
 * 마우스 오버, 클릭 등의 상호작용을 처리합니다.
 */
export const EquipmentBox: React.FC<EquipmentBoxProps> = ({ data }) => {
    // 로컬 상태: 마우스가 이 장비 위에 있는지 여부 (Hover State)
    const [hovered, setHovered] = useState(false)

    // 전역 상태: 검색 등으로 강조된 장비 ID 목록 가져오기
    const highlightedEquipmentIds = useStore(state => state.highlightedEquipmentIds)

    // 현재 이 장비가 강조되어야 하는지 확인
    const isHighlighted = highlightedEquipmentIds.includes(data.id)

    return (
        <mesh
            position={data.position} // 3D 월드 상의 위치 [x, y, z]
            // React Three Fiber의 이벤트 핸들러
            onClick={(e) => {
                e.stopPropagation() // 클릭 이벤트가 뒤에 있는 객체로 전파되는 것 방지
                // 필요 시 여기에 클릭 로직 추가 (예: 장비 상세 정보 보기)
            }}
            onPointerOver={(e) => {
                e.stopPropagation()
                setHovered(true) // 호버 상태 활성화
                useStore.getState().setHoveredEquipment(data) // 전역 상태에 현재 장비 정보 등록 (툴팁 표시용)
                document.body.style.cursor = 'pointer' // 마우스 커서를 포인터로 변경
            }}
            onPointerOut={() => {
                setHovered(false) // 호버 상태 비활성화
                useStore.getState().setHoveredEquipment(null) // 전역 상태 초기화
                document.body.style.cursor = 'auto' // 마우스 커서 복구
            }}
        >
            {/* 장비의 형상 (Geometry): 육면체 */}
            <boxGeometry args={data.size} />

            {/* 장비의 재질 (Material) */}
            {/* 호버되거나 강조된 경우 색상을 변경하여 시각적 피드백 제공 */}
            <meshStandardMaterial
                color={(hovered || isHighlighted) ? '#aaf' : (data.color || '#ffffff')} // 강조색: #aaf (연한 파랑), 기본색: 데이터 값 또는 흰색
                roughness={0.2} // 거칠기 (낮을수록 매끄러움)
                metalness={0.8} // 금속성 (높을수록 금속 느낌)
            />
        </mesh>
    )
}
