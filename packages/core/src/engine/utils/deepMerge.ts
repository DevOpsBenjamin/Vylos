/**
 * Deep merge a source object onto a target object.
 * Arrays are overwritten, but plain objects are merged recursively.
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
    const output = { ...target };

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = output[key];

            // If source is a plain object, always deep-merge (against target or fresh {})
            if (isPlainObject(sourceValue)) {
                (output as any)[key] = deepMerge(
                    isPlainObject(targetValue) ? targetValue : {},
                    sourceValue,
                );
            } else if (sourceValue !== undefined) {
                // Otherwise grab the new value if defined
                (output as any)[key] = sourceValue;
            }
        }
    }

    return output;
}

/** Check if an item is a plain object */
function isPlainObject(item: any): item is Record<string, any> {
    if (item === null || typeof item !== 'object') {
        return false;
    }

    // Exclude arrays and dates/regexps
    if (Array.isArray(item)) return false;

    const proto = Object.getPrototypeOf(item);
    return proto === Object.prototype || proto === null;
}
