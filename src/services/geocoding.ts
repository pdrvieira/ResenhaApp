/**
 * Serviço de Geocoding usando Nominatim (OpenStreetMap)
 * Gratuito, sem necessidade de API key
 * Rate limit: 1 request/segundo (respeitado pelo app)
 */

interface GeocodingResult {
    latitude: number;
    longitude: number;
    displayName: string;
}

interface NominatimResponse {
    lat: string;
    lon: string;
    display_name: string;
}

/**
 * Converte endereço em coordenadas geográficas
 * @param address Endereço completo (ex: "Rua das Flores, 123")
 * @param city Cidade (ex: "Belo Horizonte")
 * @param country País (default: "Brazil")
 * @returns Coordenadas ou null se não encontrado
 */
export const geocodeAddress = async (
    address: string,
    city: string,
    country: string = 'Brazil'
): Promise<GeocodingResult | null> => {
    try {
        const query = encodeURIComponent(`${address}, ${city}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ResenhaApp/1.0', // Nominatim requer User-Agent
            },
        });

        if (!response.ok) {
            console.warn('Geocoding request failed:', response.status);
            return null;
        }

        const data: NominatimResponse[] = await response.json();

        if (data.length === 0) {
            console.warn('No geocoding results for:', address, city);
            return null;
        }

        const result = data[0];
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            displayName: result.display_name,
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

/**
 * Geocoding reverso: coordenadas → endereço
 * Útil para quando usuário toca no mapa
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<string | null> => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ResenhaApp/1.0',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};
