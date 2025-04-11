import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"

const FilterDropdown = ({ visible, onSort, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => onSort("asc")}>
            <Text style={styles.option}>Sort by Date (Earliest First)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSort("desc")}>
            <Text style={styles.option}>Sort by Date (Latest First)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeOption}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  option: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    textAlign: "center",
  },
  closeOption: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: "center",
    color: "red",
  },
})

export default FilterDropdown
