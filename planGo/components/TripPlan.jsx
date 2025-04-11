import React, { useState, useMemo } from "react";
import { StyleSheet, View, Image, Dimensions, Text, ImageBackground, ScrollView, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import Icon from "react-native-vector-icons/FontAwesome6";
import DistanceIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTimeDistancePoints, formatTime } from "./hooks/useTimeDistancePoints";
import LinearGradient from 'react-native-linear-gradient';

const TripPlanList = () => {
  const windowWidth = Dimensions.get("window").width;
  const route = useRoute();
  const { trip } = route.params;
  const navigation = useNavigation();
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  const handleSelectPlan = (planIndex) => {
    setActivePlanIndex(planIndex); 
  };

  const { 
    origin_point:originPoint, 
    city_coordinates:cityCoordinates, 
    place_img: placeImage,
    place_name:placeName,
    date_from: fromDate,
    date_to: toDate,
  } = trip;


  const handleNavigate = (destination, routeData, dayIndex) => {
    const planRoute = routeData;
    const tripDetails = {
      tripId: trip.id,
      toDate,
      fromDate,
      originPoint,
      cityCoordinates,
      placeName,
      placeImage,
      dayIndex
    };
    navigation.navigate(destination, { planRoute, tripDetails });
  };

  let totalDistance = 0,
  totalTime = 0,
  routePoints = 0;
  
  const renderPlans = Object.values(trip.route).map((dayPlan, index) => {
    const isActive = activePlanIndex === index;
    const { tripDistance, tripTime, formatedTotalTime } = useTimeDistancePoints(dayPlan);
  
    totalDistance += tripDistance;
    totalTime += tripTime;
    routePoints += dayPlan.length;
    return (
      <View
        key={index}
        style={isActive ? styles.activePlanSection : styles.planSection}
      >
        <Text style={isActive ? styles.activePlanText : styles.planText}>{`Day ${index + 1}`}</Text>
        <TouchableOpacity
          style={isActive ? styles.activePlan : styles.plan}
          onPress={() => handleSelectPlan(index)}
        >
          <View style={{
                  display: "flex", 
                  height: "40%", 
                  alignItems: "center", 
                  flexDirection: "row", 
                  justifyContent: "space-between", 
                  width: "100%",
                  paddingHorizontal: 16 
          }}>
            <View style={styles.iconsRow}>
                <View style={styles.iconTextCol}>
                  <Icon name="person-walking" size={30} color={isActive ? "#2e3135" : "white"} />
                  <Text style={[styles.iconText, { color: isActive ? "#2e3135" : "white" }]}>{formatedTotalTime}</Text>
                </View>
                <View style={styles.iconTextCol}>
                  <DistanceIcons name="map-marker-distance" size={30} color={isActive ? "#2e3135" : "white"} />
                  <Text style={[styles.iconText, { color: isActive ? "#2e3135" : "white" }]}>{tripDistance}km</Text>
                </View>
                <View style={styles.iconTextCol}>
                  <Icon name="route" size={30} color={isActive ? "#2e3135" : "white"} />
                  <Text style={[styles.iconText, { color: isActive ? "#2e3135" : "white" }]}>{dayPlan.length} points</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleNavigate('EditTodayPlan', dayPlan, index)}>
              <DistanceIcons name="dots-vertical" color={isActive ? "#2e3135" : "white"} size={25}/>
            </TouchableOpacity>
          </View>
          {isActive && (
            <View style={styles.mapAndListContainer}>
              <TouchableOpacity style={styles.mapAndList} onPress={() => handleNavigate('DayMap', dayPlan)}>
                <View>
                  <Icon name="map-location-dot" size={25} color="#e4e8ee" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapAndList} onPress={() => handleNavigate('DayPlan', dayPlan)}>
                <View>
                  <Icon name="clipboard-list" size={25} color="#e4e8ee" />
                </View>
              </TouchableOpacity>   
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{placeName}</Text>
          <View style={styles.totalRoute}>
            <View style={styles.icons}>
              <View style={styles.totalInfoDetails}>
                <DistanceIcons name="map-marker-distance" size={40} color="white" />
                <Text style={{color:"white", fontSize:22}}>{parseFloat(totalDistance.toFixed(1))}km</Text>
              </View>
              <View style={styles.totalInfoDetails}>
                <Icon name="person-walking" size={40} color="white" />
                <Text style={{color:"white", fontSize:22}}>{formatTime(totalTime)}</Text>
              </View>
              <View style={styles.totalInfoDetails}>
                <Icon name="route" size={40} color="white" />
                <Text style={{color:"white", fontSize:22}}>{routePoints}</Text>
              </View>
              
            </View>
          </View>
        </View>
        <ImageBackground
          source={{ uri: placeImage }}
          style={styles.backgroundImage}
        />
        <View style={styles.darkOverlay}></View>
        <Svg
          height="100"
          width={windowWidth}
          viewBox={`0 0 ${windowWidth} 100`}
          style={styles.svgWave}
        >
          <Path
            fill="#000000"
            d={`M0,0 Q${windowWidth / 4},100 ${windowWidth / 2},100 Q${(3 * windowWidth) / 4},60 ${windowWidth},100 L${windowWidth},100 L0,100 Z`}
          />
        </Svg>
      </View>

      <View style={styles.centralImageWrapper}>
        <Image
          source={{ uri: placeImage }}
          style={styles.centralImage}
        />
      </View>
      <View style={styles.bottomSection}>
        <ScrollView contentContainerStyle={styles.planContainer}>
          {renderPlans}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top:0,
  },
  topSection: {
    height:Dimensions.get("window").height / 2.5,
    overflow: "hidden",
    position: "relative",
  },
  headerTop: {
    position:"absolute",
    zIndex:2,
    width: "100%",
    display: "flex",
    paddingHorizontal: 20,
    gap:15,
    top:"20%", 
  },
  title: {
    alignSelf:"center",
    fontSize: 24,
    color:"white",
  },
  totalRoute: {
    marginTop:30,
    display:"flex",
    gap:30,
  },
  backgroundImage: {
    width: Dimensions.get("window").width,
    height: "100%",
    resizeMode: "cover",
    opacity: 0.8, 
  },
  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(31, 33, 36, 0.4)", 
    blurRadius: 10, 
  },
  svgWave: {
    position: "absolute",
    bottom: 0,
  },
  centralImageWrapper: {
    position: "absolute",
    top: Dimensions.get("window").height / 2.5,
    left: "50%",
    transform: [{ translateX: -Dimensions.get("window").width / 6 }, { translateY: -Dimensions.get("window").height / 10 }],
    zIndex: 2,
    shadowColor: "#2e3135",
    shadowOffset: { width: 5, height: 7 },
    shadowOpacity: 0.5, 
    shadowRadius: 4,
  },
  centralImage: {
    width: Dimensions.get("window").width / 3,
    height: Dimensions.get("window").width / 3,
    borderRadius: 100,
  },
  bottomSection: {
    height: Dimensions.get("window").height,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  planContainer: {
    display:"flex",
    flexGrow: 1, // Omogućava da se elementi normalno prikazuju u skrolovanju
    paddingBottom: 100,
    marginTop:70,
    gap: 20,
    width:Dimensions.get("window").width,
    alignItems:"flex-end",
  },
  planSection: {
    display:"flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    width:"100%",
    alignItems:"center",
    gap: 10,
  },
  activePlanSection: {
    display:"flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    width:"95%",
    alignItems:"center",
    gap: 10,
  },
  planText: {
    transform: [{ rotate: '-90deg' }],
    fontSize: 25,
    textAlign: "center",
    color: '#2e3135',
    // color: "#c2bdbd",
    fontWeight: "bold",
  },
  activePlanText:{
    transform: [{ rotate: '-90deg' }],
    fontSize: 40,
    textAlign: "center",
    color: "#c2bdbd",
    fontWeight: "bold",
  },
  activePlan: {
    backgroundColor: "#e4e8ee",
    width:"75%",
    borderTopLeftRadius:20,
    borderBottomLeftRadius:20,
    display:"flex",
    justifyContent: "space-between",
    height: Dimensions.get("window").height * 0.15,
    paddingVertical: 10,
  },
  plan: {
    backgroundColor: "#2e3135",
    width:"60%",
    borderTopLeftRadius:10,
    borderBottomLeftRadius:10,
    display:"flex",
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height * 0.10,
  },
  iconsRow: {
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    width: "80%"
  },
  icons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5
  },
  iconTextCol: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap:5,
  },
  iconText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  mapAndListContainer: {
    display:"flex", 
    flexDirection:"row", 
    alignItems:"center",
    justifyContent:"space-between", 
    width:"90%",
    alignSelf:"center"
  },
  mapAndList: {
    paddingVertical: 5,
    backgroundColor:"#2e3135", 
    width:"35%",
    borderRadius: 5, 
    display:"flex", 
    justifyContent:"center",
    alignItems:"center"
  },
  totalInfoDetails: {
    display:"flex",
    gap: 10,
    flexDirection:"row",
    alignItems:"center"
  }
});

export default TripPlanList;
