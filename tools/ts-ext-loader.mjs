export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && !(/\.(js|ts|json|mjs|cjs)$/).test(specifier)) {
      try {
        return await nextResolve(`${specifier}.ts`, context);
      } catch {
        throw error;
      }
    }
    throw error;
  }
}
