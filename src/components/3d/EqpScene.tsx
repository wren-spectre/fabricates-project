// EqpScene verification trigger
import React, { useRef } from 'react'
import { OrbitControls, PerspectiveCamera, useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../../store/useStore'
import * as THREE from 'three'

// --- Arm 위치 설정 (회전 각도 및 Pivot 위치) ---
// HOME positions: Arm이 대기하는 초기 위치 (사용자 정의)
// CENTER positions: Arm이 웨이퍼 중앙으로 이동했을 때의 위치
const ARM_1_HOME = new THREE.Vector3(0, 0, 0);       // Arm 1 (Dispense) 초기 위치
const ARM_1_CENTER = new THREE.Vector3(0, 0.85, 0); // Arm 1 중앙 이동 위치 (약 48도 회전)

const ARM_2_HOME = new THREE.Vector3(0, 1.6, 0);     // Arm 2 (Cleaning) 초기 위치
const ARM_2_CENTER = new THREE.Vector3(0, 0.7, 0);  // Arm 2 중앙 이동 위치 (약 40도 회전)

// EQP 모드의 초기 카메라 위치 (FAB 모드보다 좀 더 가까이서 봄)
const INITIAL_CAMERA_POSITION: [number, number, number] = [5, 5, 5]

/**
 * [유틸리티 함수] 격자 무늬(Grid) 텍스처 생성 함수
 * HTML5 Canvas API를 사용하여 은색 배경에 격자 무늬 이미지를 동적으로 생성합니다.
 * 이 텍스처는 웨이퍼 표면에 적용되어 금속 질감을 표현합니다.
 */
const createGridTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (context) {
        // 1. 은색 배경 채우기
        context.fillStyle = '#C0C0C0'
        context.fillRect(0, 0, 512, 512)

        // 2. 격자 라인 그리기
        context.strokeStyle = '#808080'
        context.lineWidth = 2

        const step = 64
        for (let i = 0; i <= 512; i += step) {
            // 세로선
            context.beginPath()
            context.moveTo(i, 0)
            context.lineTo(i, 512)
            context.stroke()

            // 가로선
            context.beginPath()
            context.moveTo(0, i)
            context.lineTo(512, i)
            context.stroke()
        }
    }
    return new THREE.CanvasTexture(canvas) // Three.js 텍스처 객체로 변환하여 반환
}

const gridTexture = createGridTexture()

/**
 * SpinCoaterModel 컴포넌트
 * 스핀 코터 장비의 3D 모델을 구성하고 애니메이션을 처리합니다.
 */
const SpinCoaterModel = () => {
    // 전역 상태에서 제어 변수 가져오기
    const isSpinning = useStore(state => state.isSpinning) // 회전 여부
    const arm1Target = useStore(state => state.arm1Target) // Arm 1 목표 위치
    const arm2Target = useStore(state => state.arm2Target) // Arm 2 목표 위치

    // 각 부품의 Ref 생성 (직접 제어하기 위해)
    const chuckRef = useRef<THREE.Group>(null) // 회전 척(Chuck)
    const arm1Ref = useRef<THREE.Group>(null) // Arm 1
    const arm2Ref = useRef<THREE.Group>(null) // Arm 2

    // 애니메이션 프레임 루프
    useFrame((_state, delta) => {
        // 1. 스핀 로직 (Chuck 회전)
        if (chuckRef.current) {
            if (isSpinning) {
                chuckRef.current.rotation.y += delta * 15 // 초당 15라디안 회전 속도
            }
        }

        // 2. Arm 1 회전 애니메이션 (Dispense Arm)
        if (arm1Ref.current) {
            // 목표 위치 결정 (HOME 또는 CENTER)
            const targetRot = arm1Target === 'HOME' ? ARM_1_HOME : ARM_1_CENTER

            // lerp를 사용하여 현재 각도에서 목표 각도로 부드럽게 전환
            arm1Ref.current.rotation.x = THREE.MathUtils.lerp(arm1Ref.current.rotation.x, targetRot.x, 0.1)
            arm1Ref.current.rotation.y = THREE.MathUtils.lerp(arm1Ref.current.rotation.y, targetRot.y, 0.1)
            arm1Ref.current.rotation.z = THREE.MathUtils.lerp(arm1Ref.current.rotation.z, targetRot.z, 0.1)
        }

        // 3. Arm 2 회전 애니메이션 (Cleaning Arm)
        if (arm2Ref.current) {
            const targetRot = arm2Target === 'HOME' ? ARM_2_HOME : ARM_2_CENTER

            arm2Ref.current.rotation.x = THREE.MathUtils.lerp(arm2Ref.current.rotation.x, targetRot.x, 0.1)
            arm2Ref.current.rotation.y = THREE.MathUtils.lerp(arm2Ref.current.rotation.y, targetRot.y, 0.1)
            arm2Ref.current.rotation.z = THREE.MathUtils.lerp(arm2Ref.current.rotation.z, targetRot.z, 0.1)
        }
    })

    return (
        <group position={[0, -1, 0]}>
            {/* 1. 메인 하우징 (흰색 챔버 벽면) */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[5, 0.2, 5]} />
                <meshStandardMaterial color="#5cbb7d" />
            </mesh>
            <mesh position={[0, 2.5, -2.4]}>
                <boxGeometry args={[5, 3, 0.2]} />
                <meshStandardMaterial color="#5cbb7d" />
            </mesh>
            <mesh position={[-2.4, 2.5, 0]}>
                <boxGeometry args={[0.2, 3, 5]} />
                <meshStandardMaterial color="#5cbb7d" />
            </mesh>

            {/* 2. 프로세스 보울 (투명 원통형 보호막) */}
            <group position={[0, 1.1, 0]}>
                {/* 외부 보울 */}
                <mesh rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[2, 2, 1.5, 64, 1, true]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        transparent // 투명 활성화
                        opacity={0.3} // 불투명도 30%
                        roughness={0.1}
                        transmission={0.5} // 빛 투과율
                        thickness={0.1}
                        side={THREE.DoubleSide} // 양면 렌더링
                    />
                </mesh>
                <mesh position={[0, -0.75, 0]}>
                    <cylinderGeometry args={[2, 2, 0.1, 64]} />
                    <meshPhysicalMaterial color="#ffffff" />
                </mesh>
            </group>

            {/* 3. 회전 척 & 웨이퍼 */}
            <group ref={chuckRef} position={[0, 1.5, 0]}>
                {/* 척 (Chuck) - 검은색 받침대 */}
                <mesh position={[0, -0.2, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* 웨이퍼 (Wafer) - 은색 격자 무늬 */}
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[1.5, 1.5, 0.02, 64]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        map={gridTexture} // 생성한 격자 텍스처 적용
                        metalness={0.9}
                        roughness={0.3}
                    />
                </mesh>
            </group>

            {/* 4. Arm 1: Chemical Dispense Arm (Black) */}
            {/* Pivot Point: 회전 중심축을 [2, 2, -2] 모서리에 둠 */}
            <group ref={arm1Ref} position={[2, 2, -2]} rotation={[ARM_1_HOME.x, ARM_1_HOME.y, ARM_1_HOME.z]}>
                {/* 피벗 포스트 (기둥) */}
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                    <meshStandardMaterial color="#111" roughness={0.5} />
                </mesh>

                {/* Arm 관절 및 노즐 구조 */}
                <group position={[0, 1, 0]}>
                    <mesh position={[-1.2, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.15, 0.15, 2.5, 32]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* 노즐 드롭 (아래로 내려오는 부분) */}
                    <mesh position={[-2.4, -0.2, 0]}>
                        <cylinderGeometry args={[0.12, 0.1, 0.6, 32]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* 디스펜스 팁 (흰색 끝부분) */}
                    <mesh position={[-2.4, -0.55, 0]}>
                        <cylinderGeometry args={[0.05, 0.02, 0.2, 16]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>
            </group>


            {/* 5. Arm 2: Cleaning Arm (Static/Cleaning) */}
            {/* Pivot Point: [-2, 2, 2] 모서리에 둠 */}
            <group ref={arm2Ref} position={[-2, 2, 2]} rotation={[ARM_2_HOME.x, ARM_2_HOME.y, ARM_2_HOME.z]}>
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                <mesh position={[1, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.15, 0.15, 2, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                <mesh position={[2, 0.8, 0]}>
                    <cylinderGeometry args={[0.12, 0.1, 0.6, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* 클리닝 팁 (하늘색) */}
                <mesh position={[2, 0.45, 0]}>
                    <cylinderGeometry args={[0.05, 0.02, 0.2, 16]} />
                    <meshStandardMaterial color="#4fc3f7" />
                </mesh>
            </group>

        </group>
    )
}

/**
 * EqpScene 컴포넌트
 * EQP 모드에서 보여지는 장비 상세 뷰 씬입니다.
 * SpinCoaterModel을 포함하며, 카메라 리셋 및 키보드 조작 로직을 가집니다.
 */
export const EqpScene: React.FC = () => {
    const controlsRef = useRef<any>(null)
    const { camera } = useThree()
    const setIsCameraMoved = useStore(state => state.setIsCameraMoved)
    const resetCameraTrigger = useStore(state => state.resetCameraTrigger)

    // 키보드 조작 함수 (useFrame 외부에서 선언)
    const [, get] = useKeyboardControls()

    // 애니메이션 상태 관리용 Ref
    const isResetting = useRef(false)

    // [초기화] 컴포넌트 진입 시 카메라 및 타겟 초기화
    React.useEffect(() => {
        const [x, y, z] = INITIAL_CAMERA_POSITION
        camera.position.set(x, y, z)
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 1, 0) // 중심보다 약간 위를 바라보도록 설정
            controlsRef.current.update()
        }
        setIsCameraMoved(false)
        useStore.getState().resetCameraTrigger = 0
    }, [camera, setIsCameraMoved])

    // [리셋 버튼] 트리거 감지
    React.useEffect(() => {
        if (resetCameraTrigger > 0) {
            isResetting.current = true
        }
    }, [resetCameraTrigger])

    // [프레임 루프]
    useFrame((_state, delta) => {
        if (controlsRef.current) {
            // --- 1. 카메라 리셋 애니메이션 ---
            if (isResetting.current) {
                const targetPos = new THREE.Vector3(...INITIAL_CAMERA_POSITION)
                const targetCenter = new THREE.Vector3(0, 1, 0)

                camera.position.lerp(targetPos, 5 * delta)
                controlsRef.current.target.lerp(targetCenter, 5 * delta)
                controlsRef.current.update()

                if (camera.position.distanceTo(targetPos) < 0.05 &&
                    controlsRef.current.target.distanceTo(targetCenter) < 0.05) {

                    camera.position.copy(targetPos)
                    controlsRef.current.target.copy(targetCenter)
                    controlsRef.current.update()

                    isResetting.current = false
                    setIsCameraMoved(false)
                }
                return
            }

            // --- 2. 카메라 이동 감지 ---
            const currentPos = camera.position
            const initialPos = new THREE.Vector3(...INITIAL_CAMERA_POSITION)
            const dist = currentPos.distanceTo(initialPos)
            const targetDist = controlsRef.current.target.distanceTo(new THREE.Vector3(0, 1, 0))

            if (dist > 0.1 || targetDist > 0.1) {
                useStore.getState().setIsCameraMoved(true)
            } else {
                useStore.getState().setIsCameraMoved(false)
            }
        }

        // --- 3. WASD 키보드 이동 로직 ---
        const { forward, backward, left, right, up, down } = get()

        if ((forward || backward || left || right || up || down) && controlsRef.current) {
            const speed = 10 * delta

            // 카메라 기준 전후좌우 벡터 계산
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
            forwardVector.y = 0 // 수평 이동
            forwardVector.normalize()

            const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
            rightVector.y = 0
            rightVector.normalize()

            const upVector = new THREE.Vector3(0, 1, 0)
            const moveVector = new THREE.Vector3()

            if (forward) moveVector.add(forwardVector)
            if (backward) moveVector.sub(forwardVector)
            if (right) moveVector.add(rightVector)
            if (left) moveVector.sub(rightVector)
            if (up) moveVector.add(upVector)
            if (down) moveVector.sub(upVector)

            moveVector.normalize().multiplyScalar(speed)

            camera.position.add(moveVector)
            controlsRef.current.target.add(moveVector)
            controlsRef.current.update()
        }
    })

    return (
        <group>
            {/* 조명 및 공간 설정 */}
            <PerspectiveCamera makeDefault position={INITIAL_CAMERA_POSITION} />
            <OrbitControls makeDefault ref={controlsRef} target={[0, 1, 0]} />
            <ambientLight intensity={0.7} />
            <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />

            {/* 스핀 코터 모델 */}
            <SpinCoaterModel />

            {/* 바닥 그리드 */}
            <gridHelper args={[20, 20]} position={[0, -1, 0]} />
        </group>
    )
}
