
// ISO 12207 - Software Lifecycle Processes
export interface ModuleMetadata {
  name: string;
  version: string;
  dependencies: string[];
  lastModified: number;
  author: string;
  description: string;
}

export class LifecycleManager {
  private static instance: LifecycleManager;
  private modules: Map<string, ModuleMetadata> = new Map();
  private deprecationWarnings: Set<string> = new Set();

  static getInstance(): LifecycleManager {
    if (!LifecycleManager.instance) {
      LifecycleManager.instance = new LifecycleManager();
    }
    return LifecycleManager.instance;
  }

  registerModule(metadata: ModuleMetadata): void {
    this.modules.set(metadata.name, metadata);
    console.log(`Module registered: ${metadata.name} v${metadata.version}`);
  }

  getModuleInfo(name: string): ModuleMetadata | undefined {
    return this.modules.get(name);
  }

  getRegisteredModules(): ModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  checkDependencies(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    if (!module) return false;

    for (const dep of module.dependencies) {
      if (!this.modules.has(dep)) {
        console.warn(`Missing dependency: ${dep} required by ${moduleName}`);
        return false;
      }
    }
    return true;
  }

  deprecateModule(name: string, reason: string): void {
    this.deprecationWarnings.add(`${name}: ${reason}`);
    console.warn(`Module deprecated: ${name} - ${reason}`);
  }

  getDeprecationWarnings(): string[] {
    return Array.from(this.deprecationWarnings);
  }

  validateArchitecture(): {
    circularDependencies: string[];
    orphanedModules: string[];
    deprecatedInUse: string[];
  } {
    const circularDependencies: string[] = [];
    const orphanedModules: string[] = [];
    const deprecatedInUse: string[] = [];

    // Check for circular dependencies
    for (const [name, module] of this.modules.entries()) {
      if (this.hasCircularDependency(name, module.dependencies)) {
        circularDependencies.push(name);
      }
    }

    // Check for orphaned modules
    const referencedModules = new Set<string>();
    for (const module of this.modules.values()) {
      module.dependencies.forEach(dep => referencedModules.add(dep));
    }

    for (const name of this.modules.keys()) {
      if (!referencedModules.has(name) && name !== 'main') {
        orphanedModules.push(name);
      }
    }

    // Check for deprecated modules in use
    for (const warning of this.deprecationWarnings) {
      const moduleName = warning.split(':')[0];
      if (referencedModules.has(moduleName)) {
        deprecatedInUse.push(moduleName);
      }
    }

    return { circularDependencies, orphanedModules, deprecatedInUse };
  }

  private hasCircularDependency(moduleName: string, dependencies: string[], visited: Set<string> = new Set()): boolean {
    if (visited.has(moduleName)) return true;

    visited.add(moduleName);
    for (const dep of dependencies) {
      const depModule = this.modules.get(dep);
      if (depModule && this.hasCircularDependency(dep, depModule.dependencies, new Set(visited))) {
        return true;
      }
    }
    return false;
  }
}
