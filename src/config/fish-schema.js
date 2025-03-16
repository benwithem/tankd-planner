export const fishSchema = {
  commonName: (value) => ({
    valid: typeof value === 'string' && value.length > 0,
    message: "Must be a non-empty string",
    expected: "string"
  }),
  scientificName: (value) => ({
    valid: typeof value === 'string' && /^\w+\s\w+$/.test(value),
    message: "Must be in 'Genus species' string format",
    expected: "string"
  }),
  careLevel: (value) => ({
    valid: typeof value === 'string',
    message: "Must be a string",
    expected: "string"
  }),
  temperament: (value) => ({
    valid: typeof value === 'string',
    message: "Must be a string",
    expected: "string"
  }),
  tankSize: (value) => ({
    valid: typeof value?.minimum === 'number' && typeof value?.recommended === 'number',
    message: "Must be an object with numeric minimum/recommended values",
    expected: "{ minimum: number, recommended: number }"
  })
};