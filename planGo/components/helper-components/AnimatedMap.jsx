import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions
} from "react-native"
import FeatherIcon from "react-native-vector-icons/Feather"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import MapView, { Marker, Polyline } from "react-native-maps"
import axios from "axios"
import { calculateBestRoute } from "../../core-calc/routeAlgorithm"
import { setCurrentTrip } from "../../store/slices/tripSlice"
import { useDispatch } from "react-redux"

const AnimatedMap = ({ planParams, handleExpandMapClose, isAddPointEnabled }) => {
  const { cityCoordinates, placeName, originPoint: initialPoint, routePoints, fromDate, toDate } = planParams
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [route, setRoute] = useState(routePoints || [])
  const [markers, setMarkers] = useState(routePoints || [])
  const [isFirstMarker, setIsFirstMarker] = useState(true) 
  const [originPoint, setOriginPoint] = useState(initialPoint || null)
  const [modalVisible, setModalVisible] = useState(!originPoint) 
  const [routeOrder, setRouteOrder] = useState("UserRoute")
  const mapRef = useRef(null)

  const placeCoordinated = useRef(cityCoordinates)
    const screenWidth = Dimensions.get("window").width
    const screenHeight = Dimensions.get("window").height
    const animatedWidth = useRef(new Animated.Value(320)).current
    const animatedHeight = useRef(new Animated.Value(120)).current
    const animatedTop = useRef(new Animated.Value(screenHeight/5)).current

    const regionRef = useRef(null)

  const handleRegionChange = (region) => {
    if (regionRef.current && 
        (regionRef.current.latitude !== region.latitude || regionRef.current.longitude !== region.longitude)) {
      regionRef.current = region 
    }
  }

    useEffect(() => {
      Animated.timing(animatedWidth, {
              toValue: screenWidth,
              duration: 500,
              useNativeDriver: false,
            }).start()
        
            Animated.timing(animatedHeight, {
              toValue: screenHeight,
              duration: 500,
              useNativeDriver: false,
            }).start()
        
            Animated.timing(animatedTop, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }).start()
    }, [])

  const dispatch = useDispatch()

  const isButtonActive = markers.length > 0 && originPoint

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}`
      )
      if (response.data && response.data.display_name) {
        const locationName = response.data.name !== "" 
          ? response.data.name 
          : response.data.display_name

        const newMarker = {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          name: locationName,
          isOrigin: isFirstMarker,
          type: response.data.type ?? "undefined",
        }

        setSelectedPoint(newMarker)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location data.")
    }
  }

  const handleConfirmMarker = useCallback(() => {
    if (selectedPoint) {
      if (isFirstMarker) {
        setIsFirstMarker(false)
        setOriginPoint(selectedPoint)
      }
      setMarkers((prevMarkers) => [...prevMarkers, selectedPoint])
      setSelectedPoint(null)
  
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: selectedPoint.latitude,
          longitude: selectedPoint.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        })
      }
    }
  }, [selectedPoint, isFirstMarker])
  

  const handleDeclineMarker = () => {
    setSelectedPoint(null)
  }

  const calculateRoute = () => {
    if (markers && markers.length > 0) {
      const bestRoute = calculateBestRoute(markers, originPoint)
      setRoute(bestRoute)
    }
  }
  
  useEffect(() => {
    if (routeOrder === "BestRoute"){
      calculateRoute()
    }
    
  }, [markers])

  const handleSaveRoute = () => {
    if (!isButtonActive) Alert.alert("Warning", "Please Enter Origin Point and at least one Marker in order to have valid routes")
    const dataToPass = {
      placeName: placeName,
      dateFrom: fromDate.toISOString(),
      dateUntil: toDate.toISOString(),
      userId: "1",
      route: markers,
      originPoint
    }
    const actionToPass = (setCurrentTrip(dataToPass))
    dispatch(actionToPass)

  }

  const handleSetActiveRoute = (desiredRoute) => {
    if(desiredRoute === "UserRoute"){
      setRoute(routePoints)
    } else {
      calculateRoute()
    }
    setRouteOrder(desiredRoute)
  }


  return (
    <Animated.View
      style={[
        styles.mapContainer,
        {
          width: animatedWidth,
          height: animatedHeight,
          position: "absolute",
          top: animatedTop,
        },
      ]}
    >
      <View style={styles.header}>
        {handleExpandMapClose && (
          <View style={styles.iconHeader}>
            <TouchableWithoutFeedback onPress={handleExpandMapClose}>
              <FeatherIcon name="minimize-2" size={30} color="#181818" />
            </TouchableWithoutFeedback>
          </View>
        )}
        {!isAddPointEnabled && (
          <View style={styles.routeOptions}>
            <TouchableOpacity style={routeOrder === "UserRoute" ? {backgroundColor: "cyan", width: "40%", paddingVertical: 5, borderRadius: 5} : {backgroundColor: "grey", width: "40%", paddingVertical: 5, borderRadius: 5}} onPress={() => handleSetActiveRoute("UserRoute")}><Text style={{textAlign:"center"}}>My Route</Text></TouchableOpacity>
            <TouchableOpacity style={routeOrder === "BestRoute" ? {backgroundColor: "cyan", width: "40%", paddingVertical: 5, borderRadius: 5} : {backgroundColor: "grey", width: "40%", paddingVertical: 5, borderRadius: 5}} onPress={() => handleSetActiveRoute("BestRoute")}><Text style={{textAlign:"center"}}>Optimized Route</Text></TouchableOpacity>
          </View>
        )}
        
      </View>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Please select your "Origin Point" (The first marker will be used as the starting point for the route).</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MapView
        key={JSON.stringify(markers.map(marker => marker.id))}
        style={{ flex: 1 }}
        initialRegion={placeCoordinated.current}
        onPress={isAddPointEnabled ? handleMapPress : null}
        onRegionChangeComplete={handleRegionChange}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            pinColor={marker.isOrigin ? "blue" : "red"} 
          />
        ))}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#000" 
            strokeWidth={4} 
          />
        )}
      </MapView>

        {isAddPointEnabled && (
          <View style={styles.buttonSaveContainer}>
            <TouchableOpacity style={[styles.buttonSave, isButtonActive && styles.activeButtonSave]} onPress={handleSaveRoute}>
              <Text style={[styles.buttonText, isButtonActive && styles.activeButtonSave]}>Save Route</Text>
            </TouchableOpacity>
            
          </View>
        )}
      

      {selectedPoint && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{selectedPoint.name}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleConfirmMarker}>
              <FontAwesome name="check-circle" size={50} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeclineMarker}>
              <FontAwesome name="times-circle" size={50} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    width: 320,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    display:"flex",
    flexDirection:"row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    position: "absolute",
    top: 80,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  iconHeader: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: "#ececec",
  },
  textHeader: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: "#ececec",
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    color: "#181818",
  },
  routeOptions: {
    display: "flex",
    width:"80%",
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 20,
    justifyContent: "space-between",
  },
  infoBox: {
    position: "absolute",
    zIndex: 100,
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#181818",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
  buttonSaveContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    position: "absolute",
    bottom: 100,
    zIndex: 1,
  },
  buttonSave: {
    backgroundColor:"#fff",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  activeButtonSave: {
    backgroundColor: "#2e3135",
  },
  buttonText: {
    color: "#c2bdbd",
    fontSize: 22,
  },
  activeButonText: {
    color: "#fff",
  }
})

export default AnimatedMap
