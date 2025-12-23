/**
 * Utilitários de geolocalização
 */

/**
 * Calcula a distância entre duas coordenadas usando a fórmula Haversine
 * @returns Distância em quilômetros
 */
export const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Converte graus para radianos
 */
const toRad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

/**
 * Formata a distância para exibição
 * @returns String formatada (ex: "2,5 km" ou "800 m")
 */
export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
        // Menos de 1km, mostra em metros
        const meters = Math.round(distanceKm * 1000);
        return `${meters} m`;
    }

    if (distanceKm < 10) {
        // Menos de 10km, mostra 1 casa decimal
        return `${distanceKm.toFixed(1).replace('.', ',')} km`;
    }

    // 10km ou mais, mostra inteiro
    return `${Math.round(distanceKm)} km`;
};

/**
 * Calcula e formata a distância entre usuário e um ponto
 */
export const getFormattedDistance = (
    userLat: number | null,
    userLon: number | null,
    targetLat: number | undefined,
    targetLon: number | undefined
): string | null => {
    if (!userLat || !userLon || !targetLat || !targetLon) {
        return null;
    }

    const distance = calculateDistanceKm(userLat, userLon, targetLat, targetLon);
    return formatDistance(distance);
};
