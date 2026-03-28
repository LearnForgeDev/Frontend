import type { ServiceManifest } from '../types/serviceTypes';

class ServiceRegistry {
    private services: Map<string, ServiceManifest> = new Map();


    register(manifests: ServiceManifest[]) {
        manifests.forEach(manifest => {
            this.services.set(manifest.id, manifest);
        })
    }

    getAll(): ServiceManifest[] {
        return Array.from(this.services.values());
    }

    get(id: string): ServiceManifest | undefined {
        return this.services.get(id);
    }
}

export const serviceRegistry = new ServiceRegistry();
