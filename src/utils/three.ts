import { Scene, Material, WebGLRenderer, Object3D, Mesh } from 'three';

/**
 * Clean up a scene's materials and geometry
 */
export const cleanScene = (scene: Scene | null): void => {
    if (!scene) return;

    scene.traverse((object: Object3D) => {
        if (!(object instanceof Mesh)) return;

        const mesh = object;
        mesh.geometry?.dispose();

        if (mesh.material.isMaterial) {
            cleanMaterial(mesh.material);
        } else {
            for (const material of mesh.material) {
                cleanMaterial(material);
            }
        }
    });
};

/**
 * Clean up and dispose of a material
 */
export const cleanMaterial = (material: Material): void => {
    material.dispose();

    // @ts-ignore
    for (const key of Object.keys(material)) {
        const value = (material as any)[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
            value.dispose();

            // Close bitmap textures
            value.source?.data?.close?.();
        }
    }
};

/**
 * Clean up and dispose of a renderer
 */
export const cleanRenderer = (renderer: WebGLRenderer | null): void => {
    if (!renderer) return;

    renderer.dispose();
};

/**
 * Clean up lights by removing them from their parent
 */
export const removeLights = (lights: Object3D[]): void => {
    for (const light of lights) {
        light.parent?.remove(light);
    }
};

/**
 * Simple throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
        const now = Date.now();

        if (now - lastCall >= limit) {
            lastCall = now;
            func(...args);
        }
    };
}; 