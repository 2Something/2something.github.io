const asciiEncoder = {
    'a': 0x00, 'b': 0x01, 'c': 0x02, 'd': 0x03, 'e': 0x04, 'f': 0x05, 'g': 0x06, 'h': 0x07,
    'i': 0x08, 'j': 0x09, 'k': 0x0a, 'l': 0x0b, 'm': 0x0c, 'n': 0x0d, 'o': 0x0e, 'p': 0x0f,
    'q': 0x10, 'r': 0x11, 's': 0x12, 't': 0x13, 'u': 0x14, 'v': 0x15, 'w': 0x16, 'x': 0x17,
    'y': 0x18, 'z': 0x19, 'A': 0x1a, 'B': 0x1b, 'C': 0x1c, 'D': 0x1d, 'E': 0x1e, 'F': 0x1f,
    'G': 0x20, 'H': 0x21, 'I': 0x22, 'J': 0x23, 'K': 0x24, 'L': 0x25, 'M': 0x26, 'N': 0x27,
    'O': 0x28, 'P': 0x29, 'Q': 0x2a, 'R': 0x2b, 'S': 0x2c, 'T': 0x2d, 'U': 0x2e, 'V': 0x2f,
    'W': 0x30, 'X': 0x31, 'Y': 0x32, 'Z': 0x33, '0': 0x34, '1': 0x35, '2': 0x36, '3': 0x37,
    '4': 0x38, '5': 0x39, '6': 0x3a, '7': 0x3b, '8': 0x3c, '9': 0x3d, '_': 0x3e, '.': 0x3f,
    '-': 0x40, ',': 0x41, ':': 0x42, '[': 0x43, ']': 0x44, '{': 0x45, '}': 0x46, '"': 0x47,
    "'": 0x48, '!': 0x49, '@': 0x4a, '#': 0x4b, '$': 0x4c, '%': 0x4d, '^': 0x4e, '&': 0x4f,
    '*': 0x50, '(': 0x51, ')': 0x52, '+': 0x53, '=': 0x54, '<': 0x55, '>': 0x56, ';': 0x57,
    '/': 0x58, '?': 0x59, '\\': 0x5a, '|': 0x5b, '`': 0x5c, '~': 0x5d, ' ': 0x5e
};

const asciiDecoder = {};
for (const key in asciiEncoder) {
    asciiDecoder[asciiEncoder[key]] = key;
}

// 2. Data Type Indicators
const TYPE_STRING = 0x00;
const TYPE_NUMBER = 0x01;
const TYPE_BOOLEAN = 0x02;
const TYPE_NULL = 0x03;
const TYPE_ARRAY = 0x04;
const TYPE_OBJECT = 0x05;

// 3. Utility Functions
/**
 * Encodes a string to a byte array using our custom ASCII encoding.
 */
function encodeString(str) {
    const encoded = [];
    for (let i = 0; i < str.length; i++) {
        encoded.push(asciiEncoder[str[i]] || 0); // 0 for unknown
    }
    return encoded;
}

/**
 * Decodes a byte array back to a string using our custom ASCII encoding.
 */
function decodeString(bytes) {
    let str = '';
    for (const byte of bytes) {
        str += asciiDecoder[byte] || '?'; // ? for unknown
    }
    return str;
}

/**
 * Packs a value into a byte array, handling different data types.
 */
function packValue(value) {
    let type = -1;
    let dataBytes;

    if (typeof value === 'string') {
        type = TYPE_STRING;
        dataBytes = encodeString(value);
    } else if (typeof value === 'number') {
        type = TYPE_NUMBER;
        const buffer = new ArrayBuffer(8); // Use 8 bytes for all numbers (doubles)
        new DataView(buffer).setFloat64(0, value);
        dataBytes = new Uint8Array(buffer);
    } else if (typeof value === 'boolean') {
        type = TYPE_BOOLEAN;
        dataBytes = new Uint8Array([value ? 1 : 0]);
    } else if (value === null) {
        type = TYPE_NULL;
        dataBytes = new Uint8Array(0);
    } else if (Array.isArray(value)) {
        type = TYPE_ARRAY;
        const arrayBytes = [];
        for (const item of value) {
            const itemBytes = packValue(item); // Recursive call
            arrayBytes.push(...itemBytes);
        }
        dataBytes = new Uint8Array(arrayBytes);
    } else if (typeof value === 'object') {
        type = TYPE_OBJECT;
        const objectBytes = [];
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                const keyBytes = encodeString(key);
                const valueBytes = packValue(value[key]); // Recursive call
                //keyLength (u8) + key + valueBytes
                const keyLength = keyBytes.length;
                const keyLengthBytes = new Uint8Array([keyLength]);

                objectBytes.push(...keyLengthBytes, ...keyBytes, ...valueBytes);
            }
        }
        dataBytes = new Uint8Array(objectBytes);
    } else {
        throw new Error('Unsupported data type: ' + typeof value);
    }

    const typeByte = new Uint8Array([type]);
    return new Uint8Array([...typeByte, ...dataBytes]);
}

/**
 * Unpacks a value from a byte array.
 */
function unpackValue(bytes, offset = 0) {
    const type = bytes[offset];
    offset++;

    let value;
    let nextOffset = offset;

    switch (type) {
        case TYPE_STRING:
            const stringLength = bytes.indexOf(0, offset); // Find null terminator (for simplicity)
            const stringBytes = bytes.slice(offset, stringLength);
            value = decodeString(stringBytes);
            nextOffset = stringLength + 1; // Skip null terminator
            break;
        case TYPE_NUMBER:
            const numberBytes = bytes.slice(offset, offset + 8);
            value = new DataView(numberBytes.buffer).getFloat64(0);
            nextOffset = offset + 8;
            break;
        case TYPE_BOOLEAN:
            value = bytes[offset] === 1;
            nextOffset = offset + 1;
            break;
        case TYPE_NULL:
            value = null;
            nextOffset = offset;
            break;
        case TYPE_ARRAY:
            value = [];
            while (nextOffset < bytes.length && nextOffset > offset) {
                let result = unpackValue(bytes, nextOffset);
                value.push(result.value);
                nextOffset = result.nextOffset;
                if(nextOffset === result.nextOffset){
                    break;
                }
            }
            break;
        case TYPE_OBJECT:
            value = {};
            while (nextOffset < bytes.length && nextOffset > offset) {
                const keyLength = bytes[nextOffset];
                nextOffset++;
                const keyBytes = bytes.slice(nextOffset, nextOffset + keyLength);
                const key = decodeString(keyBytes);
                nextOffset += keyLength;
                const result = unpackValue(bytes, nextOffset);
                value[key] = result.value;
                nextOffset = result.nextOffset;
            }
            break;
        default:
            throw new Error('Unknown data type: ' + type);
    }
    return { value, nextOffset };
}


export function compressData(jsonData) {
    if (typeof jsonData !== 'object' || jsonData === null) {
        throw new Error('Input must be a JSON object or array.');
    }
    const packedData = packValue(jsonData);
    return packedData;
}

/**
 * Decompresses data from a Uint8Array back into a JSON structure.
 */
function decompressData(binaryData) {
    const result = unpackValue(binaryData);
    return result.value;
}

/**
 * Converts a Uint8Array to a URL-safe base64 string.
 */
export function toUrlSafeBase64(data) {
    let base64 = btoa(String.fromCharCode(...data));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

/**
 * Converts a URL-safe base64 string to a Uint8Array.
 */
function fromUrlSafeBase64(base64) {
    let paddedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const mod4 = paddedBase64.length % 4;
    if (mod4) {
        for (let i = 0; i < 4 - mod4; i++) {
            paddedBase64 += '=';
        }
    }
    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function obtainDecompressedDataFromSeed(seed) {
    return decompressData(fromUrlSafeBase64(seed));
}