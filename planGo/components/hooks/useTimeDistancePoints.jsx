import { useMemo } from "react";

export const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes}min`;
    } 
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    
    return `${hours}:${remainingMinutes < 10 ? "0" : ""}${remainingMinutes}`;
};

export const useTimeDistancePoints = (dailyRoute) => {
    const stats = useMemo(() => {
        if (!dailyRoute || dailyRoute.length === 0) {
            return { tripDistance: 0, tripTime: "0-min" };
        }

        let tripDistance = 0;
        let tripTime = 0;
        
        dailyRoute.forEach((point) => {
            tripDistance += point.distance || 0;
            tripTime += (point.estimated_visit_time || 0);
        });

        tripTime += (tripDistance / 5) * 60;

        return {
            tripDistance: parseFloat(tripDistance.toFixed(1)),
            tripTime: Math.round(tripTime),
            formatedTotalTime: formatTime(Math.round(tripTime)),
        };
    }, [dailyRoute]);

    return stats;
};
