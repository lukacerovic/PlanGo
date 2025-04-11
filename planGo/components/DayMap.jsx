import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import AnimatedMap from "./helper-components/AnimatedMap";
import { useRoute } from "@react-navigation/native";

const DayMap = () => {
  const route = useRoute();
  const { planRoute, tripDetails } = route.params;

  const placeParams = {
    placeName: tripDetails.placeName,
    fromDate: tripDetails.fromDate,
    toDate: tripDetails.toDate,
    cityCoordinates: tripDetails.cityCoordinates,
    routePoints: planRoute,
    originPoint: tripDetails.originPoint,
  };
  
  return (
    <View>
        <AnimatedMap 
          planParams={placeParams}
          isAddPointEnabled={false}
        />
    </View>
  );
};

export default DayMap;
