import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from "react-native";
import { formatDate } from "../helper/timeCalculations"
import { useDeleteTripMutation } from "../../store/attractionsApi";

const VoiceDeleteModal = ({ trips, visible, onClose }) => {
    const [deleteTrip] = useDeleteTripMutation()

    const handleDelete = (tripId) => {
        deleteTrip(tripId)
      }
  const message = "Are you sure you want to delete this trip?";
  const renderedTrips = trips.map((trip) => (
    <View key={trip.id} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop:30, }}>
      <Image source={{ uri: trip.place_img }} style={styles.image} />
      <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Text style={styles.tripName}>{trip.place_name}</Text>
        <Text style={styles.tripDate}>
            From: {formatDate(trip.date_from)}
            {"\n"}Until: {formatDate(trip.date_to)}
        </Text>
      </View>
    </View>
  ));

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{ minHeight: 100, padding: 20, position: "relative" }}>
            <Text style={styles.message}>{message}</Text>
            {renderedTrips}
          </View>
          <View style={styles.options}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeOption}>Close</Text>
            </TouchableOpacity>
            {/* onPress={() => handleDelete(trip.id)} */}
            <TouchableOpacity onPress={onClose} isDisabled={true}>
                <Text style={styles.deleteOption}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  deleteOption: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: "center",
    color: "red",
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
  }
});

export default VoiceDeleteModal;
