export const regex = {
    EXTRACT_TYPE_NAME: /(int|uint|bytes|string|bool|address)/g,
    EXTRACT_BITS: /(bytes|uint|int)([0-9]{1,3})/g

} as const;

export const types = {
    UINT: "uint",
    INT: "int",
    BOOL: "bool",
    BYTES: "bytes"
}