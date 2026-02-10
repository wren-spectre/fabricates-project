import React from 'react'
import fabData from '../../data/fab_data.json'
import { EquipmentBox } from './EquipmentBox'
import type { EquipmentData } from '../../types'
import { useStore } from '../../store/useStore'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useKeyboardControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// FAB 모드의 초기 카메라 위치 설정 [x, y, z]
const INITIAL_CAMERA_POSITION: [number, number, number] = [10, 10, 10]

/**
 * FabScene 컴포넌트
 * 공장 전체 레이아웃을 보여주는 3D 씬입니다.
 * 장비 배치, 카메라 조작, 검색 시 포커싱 이동 등의 기능을 담당합니다.
 */
export const FabScene: React.FC = () => {
    // JSON 데이터를 TypeScript 타입으로 캐스팅 (타입 안정성 확보)
    const equipmentList = fabData as EquipmentData[]

    // 전역 상태 가져오기
    const isSearchFocused = useStore(state => state.isSearchFocused) // 검색창 포커스 여부
    const { camera } = useThree() // Three.js 카메라 객체 접근
    const controlsRef = React.useRef<any>(null) // OrbitControls 접근을 위한 Ref
    const [, get] = useKeyboardControls() // 키보드 입력 상태 가져오기 함수

    const highlightedEquipmentIds = useStore(state => state.highlightedEquipmentIds) // 검색된 장비 ID들
    const setIsCameraMoved = useStore(state => state.setIsCameraMoved) // 카메라 이동 상태 설정 함수
    const resetCameraTrigger = useStore(state => state.resetCameraTrigger) // 카메라 리셋 트리거 값

    // 애니메이션 상태 관리용 Ref (Reset 중인지 여부)
    // useState 대신 useRef를 사용하는 이유는 렌더링을 유발하지 않고 값만 저장하기 위함입니다.
    const isResetting = React.useRef(false)

    // [초기화] 컴포넌트 마운트 시 카메라 위치 설정
    React.useEffect(() => {
        const [x, y, z] = INITIAL_CAMERA_POSITION
        camera.position.set(x, y, z)
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0) // 바라보는 지점(Target)을 원점으로 초기화
            controlsRef.current.update()
        }
        setIsCameraMoved(false)
        useStore.getState().resetCameraTrigger = 0 // 트리거 초기화
    }, [camera, setIsCameraMoved])

    // [이벤트 감지] 리셋 버튼 클릭 시 실행
    React.useEffect(() => {
        if (resetCameraTrigger > 0) {
            isResetting.current = true // 리셋 애니메이션 시작 플래그 설정
        }
    }, [resetCameraTrigger])

    // [프레임 루프] 매 프레임마다 실행되는 로직 (애니메이션, 입력 처리 등)
    useFrame((_state, delta) => {
        // --- 1. 카메라 리셋 애니메이션 ---
        if (isResetting.current && controlsRef.current) {
            const targetPos = new THREE.Vector3(...INITIAL_CAMERA_POSITION)
            const targetCenter = new THREE.Vector3(0, 0, 0)

            // lerp(Linear Interpolation)를 사용하여 부드럽게 이동 (선형 보간)
            // 현재 위치에서 목표 위치로 5 * delta 속도로 이동
            camera.position.lerp(targetPos, 5 * delta)
            controlsRef.current.target.lerp(targetCenter, 5 * delta)
            controlsRef.current.update()

            // 목표 위치에 충분히 가까워졌는지 확인 (거리 0.05 미만)
            if (camera.position.distanceTo(targetPos) < 0.05 &&
                controlsRef.current.target.distanceTo(targetCenter) < 0.05) {

                // 최종 위치로 정확하게 설정하여 애니메이션 종료
                camera.position.copy(targetPos)
                controlsRef.current.target.copy(targetCenter)
                controlsRef.current.update()

                isResetting.current = false // 리셋 종료
                setIsCameraMoved(false) // 이동 상태 해제
            }
            return // 리셋 중에는 다른 움직임 로직 실행 방지
        }

        // --- 2. 카메라 이동 감지 (Reset 버튼 표시용) ---
        if (controlsRef.current && !isResetting.current) {
            const currentPos = camera.position
            const initialPos = new THREE.Vector3(...INITIAL_CAMERA_POSITION)
            const dist = currentPos.distanceTo(initialPos) // 초기 위치와의 거리

            // 타겟(바라보는 지점)이 원점에서 벗어났는지 확인
            const targetDist = controlsRef.current.target.distanceTo(new THREE.Vector3(0, 0, 0))

            // 일정운 거리 이상 벗어나면 "카메라 이동됨" 상태로 변경 -> UI에 Reset 버튼 표시
            if (dist > 0.1 || targetDist > 0.1) {
                useStore.getState().setIsCameraMoved(true)
            } else {
                useStore.getState().setIsCameraMoved(false)
            }
        }

        // --- 3. 검색 로직 (자동 포커싱) ---
        if (highlightedEquipmentIds.length > 0) {
            // 검색된 장비들의 데이터 필터링
            const targets = equipmentList.filter(eq => highlightedEquipmentIds.includes(eq.id))

            if (targets.length > 0 && controlsRef.current) {
                // 여러 장비를 모두 포함하는 경계 박스(Bounding Box) 계산
                const min = new THREE.Vector3(Infinity, Infinity, Infinity)
                const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)

                targets.forEach(eq => {
                    const [x, y, z] = eq.position
                    min.min(new THREE.Vector3(x, y, z))
                    max.max(new THREE.Vector3(x, y, z))
                })

                // 경계 박스의 중심점 계산
                const center = new THREE.Vector3()
                center.addVectors(min, max).multiplyScalar(0.5)

                // 경계 박스의 크기 계산
                const size = new THREE.Vector3()
                size.subVectors(max, min)
                const maxDim = Math.max(size.x, size.y, size.z)

                // 카메라 타겟을 중심점으로 부드럽게 이동
                controlsRef.current.target.lerp(center, 0.1)

                // 카메라 위치를 장비들이 잘 보이도록 뒤로 이동
                const offset = maxDim * 2 + 10 // 적절한 여유 거리 계산
                const targetPos = center.clone().add(new THREE.Vector3(offset, offset, offset).normalize().multiplyScalar(offset))

                camera.position.lerp(targetPos, 0.05)
                controlsRef.current.update()
            }
        }

        // --- 4. WASD 키보드 이동 로직 ---
        const { forward, backward, left, right, up, down } = get()

        // 검색창 입력 중이거나 검색 결과 포커싱 중일 때는 키보드 이동 방지
        if (isSearchFocused) return
        if (highlightedEquipmentIds.length > 0) return

        if ((forward || backward || left || right || up || down) && controlsRef.current) {
            const speed = 10 * delta // 이동 속도

            // 카메라가 바라보는 방향(forward) 계산
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
            forwardVector.y = 0 // 수평 이동을 위해 Y축 성분 제거
            forwardVector.normalize()

            // 카메라의 오른쪽 방향(right) 계산
            const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
            rightVector.y = 0
            rightVector.normalize()

            const upVector = new THREE.Vector3(0, 1, 0) // 위쪽 방향
            const moveVector = new THREE.Vector3() // 최종 이동 벡터

            // 입력에 따라 이동 벡터 합산
            if (forward) moveVector.add(forwardVector)
            if (backward) moveVector.sub(forwardVector)
            if (right) moveVector.add(rightVector)
            if (left) moveVector.sub(rightVector)
            if (up) moveVector.add(upVector)
            if (down) moveVector.sub(upVector)

            moveVector.normalize().multiplyScalar(speed)

            // 카메라 위치와 타겟을 동시에 이동 (OrbitControls 유지하면서 이동)
            camera.position.add(moveVector)
            controlsRef.current.target.add(moveVector)
            controlsRef.current.update()
        }
    })

    return (
        <group>
            {/* 기본 원근 카메라 (makeDefault로 설정) */}
            <PerspectiveCamera makeDefault position={INITIAL_CAMERA_POSITION} />

            {/* 마우스 조작을 위한 OrbitControls */}
            <OrbitControls makeDefault ref={controlsRef} />

            {/* 장비 박스 렌더링 (map 함수 이용) */}
            {equipmentList.map((eq) => (
                <EquipmentBox key={eq.id} data={eq} />
            ))}

            {/* 바닥 그리드 헬퍼 */}
            <gridHelper args={[100, 100, 0x444444, 0x222222]} />

            {/* 바닥 평면 (그림자를 받기 위해 receiveShadow 설정) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
        </group>
    )
}
