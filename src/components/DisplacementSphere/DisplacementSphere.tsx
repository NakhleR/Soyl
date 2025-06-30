import React, { useEffect, useRef, startTransition } from 'react';
import { useReducedMotion, useSpring } from 'framer-motion';
import {
    AmbientLight,
    DirectionalLight,
    LinearSRGBColorSpace,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
    UniformsUtils,
    Vector2,
    WebGLRenderer,
} from 'three';
import fragmentShader from './displacement-sphere-fragment.glsl?raw';
import vertexShader from './displacement-sphere-vertex.glsl?raw';
import styles from './displacement-sphere.module.css';
import { useTheme } from '@/components/ThemeProvider';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useInViewport } from '@/hooks/useInViewport';
import { cleanRenderer, cleanScene, removeLights, throttle } from '@/utils/three';
import { media } from '@/utils/style';
import { Transition } from './Transition';

const springConfig = {
    stiffness: 30,
    damping: 20,
    mass: 2,
};

interface DisplacementSphereProps {
    className?: string;
}

export const DisplacementSphere: React.FC<DisplacementSphereProps> = (props) => {
    const { theme } = useTheme();
    const start = useRef<number>(Date.now());
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef<Vector2 | null>(null);
    const renderer = useRef<WebGLRenderer | null>(null);
    const camera = useRef<PerspectiveCamera | null>(null);
    const scene = useRef<Scene | null>(null);
    const lights = useRef<(DirectionalLight | AmbientLight)[] | null>(null);
    const uniforms = useRef<any>(null);
    const material = useRef<MeshPhongMaterial | null>(null);
    const geometry = useRef<SphereGeometry | null>(null);
    const sphere = useRef<Mesh | null>(null);
    const reduceMotion = useReducedMotion();
    const isInViewport = useInViewport(canvasRef);
    const windowSize = useWindowSize();
    const rotationX = useSpring(0, springConfig);
    const rotationY = useSpring(0, springConfig);

    // Get the resolved theme (considering system preference)
    const getResolvedTheme = (): 'light' | 'dark' => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme as 'light' | 'dark';
    };

    useEffect(() => {
        const { innerWidth, innerHeight } = window;
        mouse.current = new Vector2(0.8, 0.5);

        if (!canvasRef.current) return;

        renderer.current = new WebGLRenderer({
            canvas: canvasRef.current,
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true,
        });
        renderer.current.setSize(innerWidth, innerHeight);
        renderer.current.setPixelRatio(1);
        renderer.current.outputColorSpace = LinearSRGBColorSpace;

        camera.current = new PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 100);
        camera.current.position.z = 52;

        scene.current = new Scene();

        material.current = new MeshPhongMaterial();
        material.current.onBeforeCompile = shader => {
            uniforms.current = UniformsUtils.merge([
                shader.uniforms,
                { time: { value: 0 } },
            ]);

            shader.uniforms = uniforms.current;
            shader.vertexShader = vertexShader;
            shader.fragmentShader = fragmentShader;
        };

        startTransition(() => {
            geometry.current = new SphereGeometry(32, 128, 128);

            if (material.current && geometry.current && scene.current) {
                sphere.current = new Mesh(geometry.current, material.current);
                sphere.current.position.z = 0;
                // @ts-ignore - Adding custom property for animation
                sphere.current.modifier = Math.random();
                scene.current.add(sphere.current);
            }
        });

        return () => {
            if (scene.current) cleanScene(scene.current);
            if (renderer.current) cleanRenderer(renderer.current);
        };
    }, []);

    useEffect(() => {
        const currentTheme = getResolvedTheme();

        // Adjust lighting based on the actual theme
        const dirLight = new DirectionalLight(
            0xffffff,
            currentTheme === 'dark' ? 2.0 : 1.8
        );

        const ambientLight = new AmbientLight(
            0xffffff,
            currentTheme === 'dark' ? 0.4 : 2.7
        );

        dirLight.position.z = 200;
        dirLight.position.x = 100;
        dirLight.position.y = 100;

        lights.current = [dirLight, ambientLight];
        lights.current.forEach(light => scene.current?.add(light));

        return () => {
            // Safely remove lights using our updated function
            removeLights(lights.current);
        };
    }, [theme]);

    useEffect(() => {
        if (!renderer.current || !camera.current || !sphere.current) return;

        const { width, height } = windowSize;

        const adjustedHeight = height + height * 0.3;
        renderer.current.setSize(width, adjustedHeight);
        camera.current.aspect = width / adjustedHeight;
        camera.current.updateProjectionMatrix();

        // Render a single frame on resize when not animating
        if (reduceMotion && scene.current && camera.current) {
            renderer.current.render(scene.current, camera.current);
        }

        if (width <= media.mobile) {
            sphere.current.position.x = 14;
            sphere.current.position.y = 10;
        } else if (width <= media.tablet) {
            sphere.current.position.x = 18;
            sphere.current.position.y = 14;
        } else {
            sphere.current.position.x = 22;
            sphere.current.position.y = 16;
        }
    }, [reduceMotion, windowSize]);

    useEffect(() => {
        const onMouseMove = throttle((event: MouseEvent) => {
            const position = {
                x: event.clientX / window.innerWidth,
                y: event.clientY / window.innerHeight,
            };

            rotationX.set(position.y / 2);
            rotationY.set(position.x / 2);
        }, 100);

        if (!reduceMotion && isInViewport) {
            window.addEventListener('mousemove', onMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [isInViewport, reduceMotion, rotationX, rotationY]);

    useEffect(() => {
        let animation: number;

        const animate = () => {
            animation = requestAnimationFrame(animate);

            if (uniforms.current !== undefined) {
                uniforms.current.time.value = 0.00005 * (Date.now() - start.current);

            }

            if (sphere.current && scene.current && camera.current && renderer.current) {
                sphere.current.rotation.z += 0.001;
                sphere.current.rotation.x = rotationX.get();
                sphere.current.rotation.y = rotationY.get();

                renderer.current.render(scene.current, camera.current);
            }
        };

        if (!reduceMotion && isInViewport && renderer.current && scene.current && camera.current) {
            animate();
        } else if (renderer.current && scene.current && camera.current) {
            renderer.current.render(scene.current, camera.current);
        }

        return () => {
            cancelAnimationFrame(animation);
        };
    }, [isInViewport, reduceMotion, rotationX, rotationY]);

    return (
        <Transition in timeout={3000} nodeRef={canvasRef}>
            {({ visible, nodeRef }: { visible: boolean; nodeRef: React.RefObject<HTMLCanvasElement> }) => (
                <canvas
                    aria-hidden
                    className={styles.canvas}
                    data-visible={visible}
                    ref={nodeRef}
                    {...props}
                />
            )}
        </Transition>
    );
};