import React, { useState, useMemo } from "react";
import { 
  View, Text, Dimensions, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, RefreshControl 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFetchAllTripsQuery, useDeleteTripMutation } from "../store/attractionsApi";
import { useSelector } from "react-redux";
import { formatDate } from "./helper/timeCalculations";
import Filter from "react-native-vector-icons/FontAwesome";
import FilterDropdown from "./helper-components/FilterDropdown";
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useSelector((state) => state.user);
  const { isLoading, isError, refetch } = useFetchAllTripsQuery(currentUser.id);
  const [deleteTrip] = useDeleteTripMutation();
  const { tripList } = useSelector((state) => state.trip);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedTrips = useMemo(() => {
    return [...tripList].sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.date_from) - new Date(b.date_from)
        : new Date(b.date_from) - new Date(a.date_from);
    });
  }, [tripList, sortOrder]);

  const handleSort = (order) => {
    setSortOrder(order);
    setIsFilterOpen(false);
  };

  const handleDelete = (tripId) => {
    deleteTrip(tripId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (isError || !tripList || tripList.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.noTripsText}>There are no trips created, please create a new one</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CreateTrip")} style={styles.createTripCard}>
          <Text style={styles.cardText}>Create new Trip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setSelectedTripId(null)}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>My List</Text>
          <TouchableOpacity onPress={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter name="filter" color={"#f7f8fa"} size={30} />
          </TouchableOpacity>
        </View>

        {isFilterOpen && <FilterDropdown onSort={handleSort} onClose={() => setIsFilterOpen(false)} />}

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007bff"]} />
          }
        >
          <View style={styles.cardContainer}>
            {sortedTrips.map((trip) => (
              <View key={trip.id} style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("TripPlanList", { trip })}
                  onLongPress={() => setSelectedTripId(trip.id === selectedTripId ? null : trip.id)}
                >
                  <ImageBackground source={{ uri: trip.place_img }} style={styles.cardImageBackground} resizeMode="cover">
                    <Text style={styles.cardText}>{trip.place_name}</Text>
                    <Text style={styles.cardDate}>
                      From: {formatDate(trip.date_from)}
                      {"\n"}Until: {formatDate(trip.date_to)}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
                {selectedTripId === trip.id && (
                  <TouchableOpacity onPress={() => handleDelete(trip.id)} style={styles.deleteIcon}>
                    <Icon name="trash" size={24} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  createTripCard: {
    width: Dimensions.get("window").width / 1.2,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#2e3135",
  },
  header: {
    display: 'flex',
    paddingHorizontal: 30,
    width: '100%',
    height: "10%",
    marginTop: "15%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f7f8fa",
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  cardContainer: {
    gap: 20,
  },
  cardImageBackground: {
    width: Dimensions.get("window").width / 1.2,
    height: 120,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  cardText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  cardDate: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default HomeScreen;
