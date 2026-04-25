export const NETWORK_PREFIXES: Record<string, string[]> = {
    'MTN': [
        '0803', '0806', '0810', '0813', '0814', '0816', 
        '0903', '0906', '0913', '0916', '0703', '0706'
    ],
    'Airtel': [
        '0802', '0808', '0812', '0902', '0907', 
        '0901', '0912', '0911', '0701', '0708', '0704'
    ],
    'Glo': [
        '0805', '0807', '0811', '0815', '0905', '0915', '0705'
    ],
    '9mobile': [
        '0809', '0817', '0818', '0908', '0909'
    ]
};

/**
 * Detects the network based on phone number prefix.
 * @param phone Phone number string
 * @returns Network name or null if unknown
 */
export const detectNetwork = (phone: string): string | null => {
    if (!phone || phone.length < 4) return null;
    
    // Normalize phone number to 0... format if starts with +234 or 234
    let normalizedPhone = phone;
    if (phone.startsWith('+234')) {
        normalizedPhone = '0' + phone.substring(4);
    } else if (phone.startsWith('234')) {
        normalizedPhone = '0' + phone.substring(3);
    }

    const prefix = normalizedPhone.substring(0, 4);

    for (const [network, prefixes] of Object.entries(NETWORK_PREFIXES)) {
        if (prefixes.includes(prefix)) {
            return network;
        }
    }

    return null;
};
