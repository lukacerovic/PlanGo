import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useCityCordinations } from "../hooks/useCityCordinations";
import { useFetchAttractionImageQuery, useFetchAttractionsInfosQuery } from "../../store/attractionsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import DateTimePicker from '@react-native-community/datetimepicker';
import MapAndCarousel from "./MapAndCarousel";
import AnimatedMap from "./AnimatedMap";
import { useCreateTrip } from "../hooks/useCreateTrip";

const VoiceCreateModal = ({ trip, visible, onClose }) => {
  const cityCoordinates = useCityCordinations(trip.place_name)
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: attractionsList } = useFetchAttractionsInfosQuery(trip.place_name)
  const { data: attractionsWithImage } = useFetchAttractionImageQuery(
      attractionsList && attractionsList.length > 0 ? attractionsList : skipToken
    ) 
  const { handleCreateTrip } = useCreateTrip()
  const [attractions, setAttractions] = useState([])
  const [fromDate, setFromDate] = useState(trip.date_from ? new Date(trip.date_from) : new Date());
  const [untilDate, setUntilDate] = useState(trip.date_to ? new Date(trip.date_to) : new Date());
  
  const route = {
    fromDate: new Date(trip.date_from),
    placeName: trip.place_name,
    toDate: new Date(trip.date_to)
  }
  const handleExpandMap = () => {
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleExpandMapClose = () => {
    setIsExpanded(false)
  }
  const message = `Please select your origin point and attractions for your trip to ${trip.place_name}`;

  useEffect(() => {
      if (attractionsWithImage && attractionsWithImage.length > 0) {
        setAttractions(attractionsWithImage);
      }
    }, [attractionsWithImage]);

    const onChangeFromDate = (event, selectedDate) => {
      if (selectedDate) {
        setFromDate(selectedDate);
      }
    };
    
    const onChangeUntilDate = (event, selectedDate) => {
      if (selectedDate) {
        setUntilDate(selectedDate);
      }
    };
    
    const handleCreate = async () => {
      const routeData = {
        fromDate: route.fromDate,
        toDate: route.toDate
      }
      const imageUrl = trip.place_img
      handleCreateTrip(imageUrl, cityCoordinates, routeData)
      onClose()
    }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{ minHeight: 100, padding: 20, position: "relative" }}>
            <Text style={styles.message}>{message}</Text>
            <View key={trip.id} style={{ display: "flex", flexDirection: "column", gap:20, alignItems: "center", marginTop:30, marginBottom:30 }}>
              <Text style={styles.tripName}>{trip.place_name}</Text>
              <View style={{ display: "flex", flexDirection: "row", gap:40, alignItems:"center", }}>
                <View>
                  <Text style={{ fontSize: 16, marginBottom: 5 }}>From:</Text>
                  <DateTimePicker
                    testID="fromDatePicker"
                    value={fromDate}
                    mode="date"
                    display="default"
                    onChange={onChangeFromDate}
                    style={{ backgroundColor: '#fff', borderRadius: 5 }}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 16, marginBottom: 5 }}>Until:</Text>
                  <DateTimePicker
                    testID="untilDatePicker"
                    value={untilDate}
                    mode="date"
                    display="default"
                    onChange={onChangeUntilDate}
                    style={{ backgroundColor: '#fff', borderRadius: 5 }}
                  />
                </View>
              </View>
            </View>
            <MapAndCarousel cityCoordinates={cityCoordinates} route={route} handleExpandMap={handleExpandMap}/>
          
          </View>
          <View style={styles.options}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeOption}>Close</Text>
            </TouchableOpacity>
            {/* onPress={() => handleDelete(trip.id)} */}
            <TouchableOpacity onPress={handleCreate} isDisabled={true}>
                <Text style={styles.createOption}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {isExpanded && (
        <AnimatedMap
          planParams={{ ...route, cityCoordinates }}
          handleExpandMapClose={handleExpandMapClose}
          isAddPointEnabled={true}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    display: "flex",
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    alignSelf: "center",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    alignSelf: "center",
  },
  options: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 12,
  },
  createOption: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: "center",
    color: "green",
  },
  closeOption: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: "center",
    color: "#181818",
  },
  image: {
    borderRadius: 10,
  },
  tripName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tripDate: {
    fontSize: 16,
  },
  carouselContainer: {
    marginTop:20
  }
});

export default VoiceCreateModal;
