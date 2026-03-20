import type { ServiceManifest } from '../types/serviceTypes'; // Correct import path
import { lessonsManifest } from './Lessons/manifest.tsx';

// Registry as a specialized Map
class ServiceRegistry {
    private services: Map<string, ServiceManifest> = new Map();

    register(manifest: ServiceManifest) {
        if (this.services.has(manifest.id)) {
            console.warn(`Service ${manifest.id} is already registered. Overwriting.`);
        }
        this.services.set(manifest.id, manifest);
    }

    getAll(): ServiceManifest[] {
        return Array.from(this.services.values());
    }

    get(id: string): ServiceManifest | undefined {
        return this.services.get(id);
    }
}

export const registry = new ServiceRegistry();

// Initialize with core services
registry.register(lessonsManifest);
