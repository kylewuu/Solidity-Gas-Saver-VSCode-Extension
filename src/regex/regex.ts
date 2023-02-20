export const regex = {
    MATCH_ALL_GLOBAL_VARIABLE: /(uint[0-9]{0,3}|int[0-9]{0,3}|string|bool|address)\s*[a-zA-Z0-9_ ]{1,100}\s*=/,
    
    UINT128_GLOBAL_VARIABLE: /asdf/
} as const;