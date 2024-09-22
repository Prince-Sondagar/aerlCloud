export const prettyPrintFWVersion = (value: number) => {
    // Given firmware version as a decimal number
    const fw_version_decimal = value;

    // Convert to hexadecimal to see the individual bytes more clearly
    let fw_version_hex = value.toString(16).padStart(8, '0');

    // Assuming little-endian format, convert the hexadecimal representation to individual bytes
    // and interpret them according to the struct fields
    const fw_version_bytes = new Uint8Array(4);
    fw_version_bytes[0] = parseInt(fw_version_hex.substr(6, 2), 16);
    fw_version_bytes[1] = parseInt(fw_version_hex.substr(4, 2), 16);
    fw_version_bytes[2] = parseInt(fw_version_hex.substr(2, 2), 16);
    fw_version_bytes[3] = parseInt(fw_version_hex.substr(0, 2), 16);

    // Extract the version fields assuming the bytes are in little-endian order
    // (least significant byte first)
    const fw_version_fields_le = {
        'major': fw_version_bytes[3],
        'minor': fw_version_bytes[2],
        'patch': fw_version_bytes[1],
        'reserved': fw_version_bytes[0],
    };

    // Extract the version fields assuming the bytes are in big-endian order
    // (most significant byte first)
    const fw_version_fields_be = {
        'major': fw_version_bytes[0],
        'minor': fw_version_bytes[1],
        'patch': fw_version_bytes[2],
        'reserved': fw_version_bytes[3],
    };

    const major = fw_version_fields_le.major;
    const minor = fw_version_fields_le.minor;
    const patch = fw_version_fields_le.patch;
    const reserved = fw_version_fields_le.reserved;

    return `${major}.${minor}.${patch}.${reserved}`;
}