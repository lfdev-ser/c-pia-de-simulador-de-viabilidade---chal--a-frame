import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AFrame3DViewerProps {
  base: number;
  height: number;
  length: number;
}

export default function AFrame3DViewer({ base, height, length }: AFrame3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height_px = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height_px, 0.1, 1000);
    camera.position.set(base * 1.5, height * 1.2, length * 1.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height_px);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(base, height * 2, length);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(base * 3, length * 3);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // A-Frame Structure
    const halfBase = base / 2;

    // Base (foundation)
    const baseGeometry = new THREE.BoxGeometry(base, 0.3, length);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7 });
    const baseFrame = new THREE.Mesh(baseGeometry, baseMaterial);
    baseFrame.position.y = 0.15;
    baseFrame.castShadow = true;
    baseFrame.receiveShadow = true;
    scene.add(baseFrame);

    // Left wall (triangle)
    const leftWallGeometry = new THREE.BufferGeometry();
    const leftWallVertices = new Float32Array([
      -halfBase, 0, 0,           // bottom left
      halfBase, 0, 0,            // bottom right
      0, height, 0,              // top center
      -halfBase, 0, length,      // bottom left back
      halfBase, 0, length,       // bottom right back
      0, height, length,         // top center back
    ]);
    leftWallGeometry.setAttribute('position', new THREE.BufferAttribute(leftWallVertices, 3));
    leftWallGeometry.setIndex([
      0, 2, 1, // front triangle
      3, 4, 5, // back triangle
      0, 1, 4, 3, // bottom
      0, 3, 5, 2, // left side
      1, 2, 5, 4, // right side
    ]);
    leftWallGeometry.computeVertexNormals();

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xE8D4C0,
      roughness: 0.8,
      metalness: 0.1,
    });
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Roof (simple triangular prism)
    const roofGeometry = new THREE.BufferGeometry();
    const roofVertices = new Float32Array([
      -halfBase, 0, 0,           // bottom left front
      halfBase, 0, 0,            // bottom right front
      0, height, 0,              // top center front
      -halfBase, 0, length,      // bottom left back
      halfBase, 0, length,       // bottom right back
      0, height, length,         // top center back
    ]);
    roofGeometry.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
    roofGeometry.setIndex([
      0, 2, 1, // front triangle
      3, 4, 5, // back triangle
      0, 1, 4, 3, // bottom
      0, 3, 5, 2, // left slope
      1, 2, 5, 4, // right slope
    ]);
    roofGeometry.computeVertexNormals();

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.castShadow = true;
    roof.receiveShadow = true;
    scene.add(roof);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        const rotationSpeed = 0.005;
        const distance = Math.sqrt(
          camera.position.x ** 2 +
          camera.position.y ** 2 +
          camera.position.z ** 2
        );

        // Rotate around center
        const theta = Math.atan2(camera.position.z, camera.position.x);
        const phi = Math.acos(camera.position.y / distance);

        const newTheta = theta - deltaX * rotationSpeed;
        const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaY * rotationSpeed));

        camera.position.x = distance * Math.sin(newPhi) * Math.cos(newTheta);
        camera.position.y = distance * Math.cos(newPhi);
        camera.position.z = distance * Math.sin(newPhi) * Math.sin(newTheta);
        camera.lookAt(0, height / 2, length / 2);

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Zoom with scroll
    renderer.domElement.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const direction = camera.position.clone().normalize();
      const distance = camera.position.length();
      const newDistance = Math.max(5, Math.min(50, distance + (e.deltaY > 0 ? 1 : -1) * zoomSpeed * distance));
      camera.position.copy(direction.multiplyScalar(newDistance));
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('wheel', () => {});
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [base, height, length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎨 Visualização 3D Interativa</span>
          <span className="text-xs font-normal text-gray-600">Arraste para rotacionar | Scroll para zoom</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '400px',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'grab',
          }}
        />
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-semibold">Base:</span> {base.toFixed(2)}m
          </div>
          <div>
            <span className="font-semibold">Altura:</span> {height.toFixed(2)}m
          </div>
          <div>
            <span className="font-semibold">Comprimento:</span> {length.toFixed(2)}m
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
