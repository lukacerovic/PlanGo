import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useCityCordinations = (placeName) => {
    const [cityCoordinates, setCityCoordinates] = useState({});
    const prevPlaceName = useRef(null);

    const fetchCoordinates = useCallback(async () => {
        if (!placeName || placeName === prevPlaceName.current) return;

        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${placeName}&format=json&addressdetails=1&limit=1`
            );

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setCityCoordinates({
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon),
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                });
                prevPlaceName.current = placeName;
            }
        } catch (error) {
            console.error("Error fetching geolocation data:", error);
        }
    }, [placeName]);

    useEffect(() => {
        fetchCoordinates();
    }, [fetchCoordinates]);

    return cityCoordinates;
};
