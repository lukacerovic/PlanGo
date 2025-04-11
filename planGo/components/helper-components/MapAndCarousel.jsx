import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native"
import MapView from "react-native-maps"

import CustomCarousel from "./Carousel"
import AnimatedMap from "./AnimatedMap"
import { useFetchAttractionImageQuery, useFetchAttractionsInfosQuery } from "../../store/attractionsApi"
import { skipToken } from "@reduxjs/toolkit/query"

const MapAndCarousel = ({ cityCoordinates, route, handleExpandMap }) => {
  const [selectedAttractions, setSelectedAttractions] = useState({})
  const [attractions, setAttractions] = useState([])

  const { data: attractionsList } = useFetchAttractionsInfosQuery(route.placeName)
  
  const { data: attractionsWithImage, isSuccess: attractionsAreFetched } = useFetchAttractionImageQuery(
    attractionsList && attractionsList.length > 0 ? attractionsList : skipToken
  )
  
  useEffect(() => {
    if (attractionsWithImage && attractionsWithImage.length > 0) {
      setAttractions(attractionsWithImage);
    }
  }, [attractionsWithImage]);


  const handleSelectAttraction = (index, attraction) => {
    const isAttractionSelected = Object.keys(selectedAttractions).includes(index.toString());

    if(!isAttractionSelected) {
      const currentSelectedAttractions = { ...selectedAttractions }
      setSelectedAttractions({ ...currentSelectedAttractions, [index]: attraction})
    } else {
      const filteredAttractions = { ...selectedAttractions }
      delete filteredAttractions[index]
      setSelectedAttractions(filteredAttractions)
    }
    setAttractions((prevAttractions) => {
        return prevAttractions.map((attr, i) =>
            i === index ? { ...attr, isSelected: !attr.isSelected } : attr
        )
    })
  }
  return (
    <View style={{display:"flex", alignItems: "center"}}>
        <TouchableWithoutFeedback onPress={handleExpandMap}>
            <View style={styles.mapContainer}>
              <View style={styles.mapTextContainer}><Text style={styles.mapText}>Set your points to visit</Text></View>
              <MapView
                key={cityCoordinates.latitude + cityCoordinates.longitude}
                style={{ flex: 1 }}
                initialRegion={cityCoordinates}
              />
            </View>      
        </TouchableWithoutFeedback>
        
        <Text style={styles.sectionTitle}>Select Popular Attractions To Visit</Text>
        {attractions && attractions.length > 0 ? (
          <View style={styles.carouselContainer}>
            <CustomCarousel data={attractions} title={"Popular Attractions"} onSelect={handleSelectAttraction} />
          </View>
        ) : (
          <Text>Loading attractions...</Text>
        )}
    </View>
  )
}

const styles = StyleSheet.create({
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
    color:"#fff"
  },
  carouselContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 10,
    paddingBottom: 30, // Sprečava sečenje poslednjeg Carousel-a
  },
})

export default MapAndCarousel
