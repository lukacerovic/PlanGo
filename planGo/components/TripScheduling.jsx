import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text, ImageBackground, Dimensions, TouchableOpacity } from "react-native";
import AnimatedMap from "./helper-components/AnimatedMap";
import { useCityCordinations } from "./hooks/useCityCordinations";
import LinearGradient from 'react-native-linear-gradient';

import { useSearchImageQuery } from "../store/attractionsApi";
import { useCreateTrip } from "./hooks/useCreateTrip";
import MapAndCarousel from "./helper-components/MapAndCarousel";

const TripScheduling = ({ route }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const cityCoordinates = useCityCordinations(route.params.placeName);

  const { handleCreateTrip } = useCreateTrip();
  const { placeName } = route.params;
  const { data: imageData } = useSearchImageQuery(placeName);

  useEffect(() => {
    if (route.params.placeName && imageData?.image_url) {
      setImageUrl(imageData.image_url);
    }
  }, [route.params.placeName, imageData]);

  const handleExpandMap = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleExpandMapClose = () => {
    setIsExpanded(false);
  };

  const handleCreate = async () => {
    const routeData = {
      fromDate: route.params.fromDate,
      toDate: route.params.toDate,
    };
    handleCreateTrip(imageUrl, cityCoordinates, routeData);
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
        <View style={styles.topSection}>
          <ImageBackground
            key={cityCoordinates.latitude + cityCoordinates.longitude + 1}
            source={{ uri: imageUrl }}
            style={styles.backgroundImage}
          >
            <View style={styles.placeDetails}>
              <Text style={styles.title}>{route.params.placeName}</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Select By Map Points</Text>

          <MapAndCarousel cityCoordinates={cityCoordinates}  route={route.params} handleExpandMap={handleExpandMap}/>
          
          <View style={styles.createTripButtonWrapper}>
            <TouchableOpacity style={styles.createTripButton} onPress={handleCreate}>
              <Text style={styles.createTripButtonText}>Create Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isExpanded && (
          <AnimatedMap 
            planParams={{ ...route.params, cityCoordinates }}
            handleExpandMapClose={handleExpandMapClose}
            isAddPointEnabled={true}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: Dimensions.get("window").height + 200,
    paddingBottom: 50,
  },
  topSection: {
    height: "20%",
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    width: Dimensions.get("window").width,
    height: "100%",
    resizeMode: "cover",
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  placeDetails: {
    position: "absolute",
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    zIndex: 3,
    bottom: 0,
    color: "white",
    height: "100%",
    padding: 20,
  },
  title: {
    fontSize: 55,
    color: "white",
  },
  bottomSection: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 30,
  },
  mapContainer: {
    width: 320,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderBlockColor: "black",
  },
  mapTextContainer: {
    position:"absolute",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    bottom: 5,
    left: 5,
  },
  mapText: {
    color:"#fff",
  },
  carouselContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 10,
    paddingBottom: 30, // Sprečava sečenje poslednjeg Carousel-a
  },
  createTripButtonWrapper: {
    alignItems: "center",
    marginVertical: 20,
  },
  createTripButton: {
    backgroundColor: "#2e3135",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createTripButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default TripScheduling;
