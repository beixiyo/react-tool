const dependencyFields = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const

export function createPackageExternal(...packages: Array<PackageJson | undefined>) {
  const deps = new Set<string>()

  for (const pkg of packages) {
    if (!pkg)
      continue

    for (const field of dependencyFields) {
      for (const dep of Object.keys(pkg[field] || {})) {
        deps.add(dep)
      }
    }
  }

  return (id: string) => {
    if (id.startsWith('\0'))
      return false

    return Array.from(deps).some(
      dep => id === dep || id.startsWith(`${dep}/`),
    )
  }
}

/**
 * Minimal package manifest shape used to compute library externals
 */
export interface PackageJson {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}
