import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { useRoute } from "@react-navigation/native";
import { formatTime } from "./helper/timeCalculations";
import LinearGradient from 'react-native-linear-gradient';
import { useGetDirectionsQuery } from '../store/attractionsApi';
import { skipToken } from '@reduxjs/toolkit/query';

const DayPlan = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const route = useRoute();
  const { planRoute, tripDetails } = route.params;
  const [routeGuidance, setRouteGuidance] = useState([]);

  const { data: routeDirectionData } = useGetDirectionsQuery(
    activeIndex < planRoute.length - 1
      ? {
          start_lat: planRoute[activeIndex].latitude,
          start_lon: planRoute[activeIndex].longitude,
          end_lat: planRoute[activeIndex + 1].latitude,
          end_lon: planRoute[activeIndex + 1].longitude,
        }
      : skipToken, 
      {
        refetchOnMountOrArgChange: true
      }
  );

  const data = planRoute.map((point, index) => ({
    time: `${formatTime(point.arrival_time)} - ${formatTime(point.finish_time)}`,
    title: point.name,
    img: point.img ?? { uri: tripDetails.placeImage },
    circleColor: activeIndex === index ? "#29B3FF" : '#fff',
    lineColor: '#d9d9d9',
    coordinateString: `${point.latitude},${point.longitude}`
  }));

  useEffect(() => {
    if (routeDirectionData) {
      const directionToMap = routeDirectionData.features[0]?.properties?.segments[0]?.steps
      setRouteGuidance(directionToMap.map((step, index) => (
      <View key={index} style={styles.routeStepContainer}>
        <Text style={styles.routeInstruction}>{step.instruction}</Text>
        <Text style={styles.routeDistance}>
          {step.distance} m
        </Text>
        
      </View>
    )));
    }
    
  }, [routeDirectionData, activeIndex]);

  const handlePress = (index) => {
    setActiveIndex(index);
  };
  

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.headerPart}>
        <Text style={styles.headerText}>Plan For Today</Text>
      </View>
      <View style={styles.timelineContainer}>
        <Timeline
          key={`${activeIndex}-${routeGuidance.length}`}
          data={data}
          circleSize={0}
          renderDetail={(rowData, rowID) => {
            const index = parseInt(rowID, 10);
            const isActive = activeIndex === index;
            return (
              <View key={rowID}>
                <TouchableOpacity onPress={() => handlePress(index)}>
                  <Animated.View
                    style={[styles.detailContainer, isActive && styles.detailActiveContainer]}
                  >
                    <Image source={rowData.img} style={[styles.image, isActive && styles.activeImage]} />
                    <View style={styles.textContainer}>
                      <Text style={[styles.title, isActive && styles.activeTitle]}>
                        {rowData.title.length > 20 && !isActive ? rowData.title.slice(0, 20) + '...' : rowData.title}
                      </Text>
                    </View>
                    <Text style={[styles.time, isActive && styles.activeTime]}>
                      {rowData.time}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
                {isActive && routeGuidance.length > 0 && activeIndex < planRoute.length - 1 && (
                  <ScrollView key={`${routeGuidance.length}-${activeIndex}`} horizontal showsHorizontalScrollIndicator={false}>
                    {routeGuidance}
                  </ScrollView>
                )}
              </View>
              
            );
          }}
          renderFullLine={routeGuidance.length > 0}
          separator={false}
          showTime={false}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    justifyContent: 'space-between',
  },
  headerPart: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    paddingTop: "20%",
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c2bdbd',
  },
  timelineContainer: {
    height: '80%',
    padding: 10,
    paddingBottom: 100,
  },
  detailActiveContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    transition: 'all 0.3s ease',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
    width:"100%"
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeTitle: {
    padding: 10,
    color: '#fff',
    fontSize: 32,
    backgroundColor: "rgba(128, 128, 128, 0.8)",
    borderRadius: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  activeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 0,
    borderRadius: 10,
  },
  time: {
    alignSelf: 'flex-start',
    backgroundColor: '#ddd',
    color: '#000',
    padding: 5,
    borderRadius: 13,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTime: {
    color: '#2e3135',
    margin: 10,
  },
  routeText: {
    color: '#29B3FF',
    fontSize: 14,
    marginTop: 5,
  },
  transportInfo: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 8,
  },
  transportText: {
    color: '#333',
    fontSize: 12,
  },
  routeStepContainer: {
    zIndex: 3,
    maxWidth: "95%",
    marginRight: 20,
    marginTop: 10,
    backgroundColor: '#4c5259',
    borderRadius: 10,
    padding: 7,
    alignItems: 'center',
    justifyContent: "center"
  },
  routeInstruction: {
    color: '#fff',
    fontSize: 14,
  },
  routeDistance: {
    color: '#fff',
    fontSize: 12,
  },
});

export default DayPlan;
