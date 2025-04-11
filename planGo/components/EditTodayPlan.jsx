import React, { useState, useMemo } from 'react';
import { View, Text, Image, Animated, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRoute } from "@react-navigation/native";
import DynamicModal from './helper-components/DynamicModal';
import { formatTime } from "./helper/timeCalculations";
import { useUpdateTripRouteMutation } from "../store/attractionsApi";

const EditTodayPlan = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState(null);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);

  const [updateRoute] = useUpdateTripRouteMutation();
  const route = useRoute();
  const { planRoute, tripDetails } = route.params;

  const data = planRoute.map((point, index) => ({
      id: index + 1,
      time: `${formatTime(point.arrival_time)} - ${formatTime(point.finish_time)}`,
      title: point.name,
      img: point.img ?? { uri: tripDetails.placeImage },
      lineColor: '#d9d9d9',
  }));

  const [todaysPoints, setTodaysPoints] = useState(data);
  const handleSaveChanges = () => {
    const todaysPointsList = Object.values(todaysPoints);
    const reorderPlanRoute = todaysPointsList.map((point) => {
      const newArrivalTime = point?.newStartTime || planRoute[point.id - 1]?.arrival_time;
      const newFinishTime = point?.newEndTime || planRoute[point.id - 1]?.finish_time;

      return {
        ...planRoute[point.id - 1],
        name: point.title,
        arrival_time: newArrivalTime,
        finish_time: newFinishTime,
      };
    });

    const objectToPass = {
      dayIndex: tripDetails.dayIndex,
      tripId: tripDetails.tripId,
      planRoute: reorderPlanRoute,
    };

    try {
      updateRoute(objectToPass).unwrap();
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", error.data?.msg || "Failed to update profile.");
    }
    
  };
  
  const renderItem = ({ item, drag, isActive }) => {
    const animatedStyle = useMemo(() => {
      return {
        backgroundColor: isActive ? '#f0f0f0' : '#f8f8f8',
      };
    }, [isActive]);

    const truncatedTitle = item.title.length > 20 ? item.title.slice(0, 20) + '...' : item.title;

    const handleShowModal = ({message, type, currentItem}) => {
      setModalType(type);
      setModalTitle(message);
      setCurrentItem(currentItem);
      setIsModalOpen(true);
    };

    return (
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
        <View style={styles.numberDot}>
          <Text style={{color: '#fff',}}>
            {todaysPoints.indexOf(item) + 1}
          </Text>
        </View>
        
        <Animated.View style={[styles.detailContainer, animatedStyle]} onTouchStart={drag}>
          <Image source={item.img} style={styles.image} />
          <View style={styles.textContainer}>
            <TouchableOpacity onPress={() => handleShowModal({ message: `Full title: ${item.title}`, type: "info", currentItem: item })}> 
              <Text style={styles.title}>{truncatedTitle}</Text>
            </TouchableOpacity>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={styles.time}>{item.time}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent:"flex-end", gap: 10 }}>
              <TouchableOpacity 
                onPress={() => handleShowModal({message: `Are you sure you want to delete: ${item.title}`, type: "delete", currentItem: item })}
              >
                <Icon name="trash-alt" size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleShowModal({message: `Edit: ${item.title}`, type: "edit", currentItem: item })}
              >
                <Icon name="edit" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        { isModalOpen && (
          <DynamicModal 
            visible={isModalOpen} 
            message={modalTitle} 
            type={modalType} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveEdit} 
            initialData={currentItem}
          />
        )}
      </View>
    );
  };

  const handleSaveEdit = (changedItem) => {
    if (changedItem) {
      const updatedPoints = todaysPoints.map((item) => 
        item.id === changedItem.id ? { ...item, ...changedItem } : item
      );
      setTodaysPoints(updatedPoints);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{width:"100%"}}>
          <Text style={styles.headerText}>Edit Today's Plan</Text>
        </View>
        <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
          <Text>Save Changes</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.scrollContainer}>
        <DraggableFlatList
          data={todaysPoints}
          onDragEnd={({ data }) => setTodaysPoints(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.draggableFlatListContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    marginTop: 80,
    width: '100%',
    height: '10%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#060811',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  container: {
    flex: 1,
    display: 'flex',
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
    flex: 1,
  },
  draggableFlatListContent: {
    paddingVertical: 10,
  },
  detailContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  numberDot: { 
    backgroundColor:"#2e3135",
    height:20,
    width: 20,
    borderRadius: 100,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    marginRight: 10
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  image: {
    width: 90,
    height: 90,
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
});

export default EditTodayPlan;
