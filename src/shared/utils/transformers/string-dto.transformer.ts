import { Transform, plainToInstance } from 'class-transformer';

/**
 * Custom decorator to transform a JSON string into an instance of the specified DTO class.
 * @param dtoClass - The DTO class to which the JSON string should be transformed.
 * @returns A Transform decorator.
 */
export function TransformToDto<T>(dtoClass: new (...args: any[]) => T) {
    return Transform(({ value }) => {
        if (typeof value !== 'string') {
            // Si la valeur n'est pas une chaîne, on la retourne telle quelle
            return value;
        }

        try {
            // Si la valeur est une chaîne JSON valide, on la transforme en instance
            return plainToInstance(dtoClass, JSON.parse(value));
        } catch {
            // Si ce n'est pas un JSON valide, on retourne la valeur brute
            return value;
        }
    });
}

/**
 * Custom decorator to transform a JSON string into an array of instances of the specified DTO class.
 * @param dtoClass - The DTO class to which the JSON array should be transformed.
 * @returns A Transform decorator.
 */
export function TransformToDtoArray<T>(dtoClass: new (...args: any[]) => T) {
    return Transform(({ value }) => {
        if (!value) return undefined;

        try {
            const parsedValue = JSON.parse(value);
            return Array.isArray(parsedValue)
                ? plainToInstance(dtoClass, parsedValue)
                : undefined;
        } catch {
            return undefined;
        }
    });
}

export function TransformToEnumDto<T>(dtoClass: new (...args: any[]) => T) {
    return Transform(({ value }) =>
        value ? plainToInstance(dtoClass, value) : undefined
    );
}
