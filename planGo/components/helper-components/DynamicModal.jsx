import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import { formatTime, formatDateToISO } from "../helper/timeCalculations"

const DynamicModal = ({ visible, onClose, message, type, onSave, initialData }) => {
  const { title, time } = initialData

  const currentDate = new Date();
  const [startTime, setStartTime] = useState(new Date(`${currentDate.toISOString().split('T')[0]}T${time.split(' - ')[0]}:00`));
  const [endTime, setEndTime] = useState(new Date(`${currentDate.toISOString().split('T')[0]}T${time.split(' - ')[1]}:00`));
  
  const [inputValue, setInputValue] = useState(title)


  const handleSave = () => {
    const formattedStartTime = formatTime(startTime)
    const formattedEndTime = formatTime(endTime)
    const changedItem = {
      id: initialData.id,
      title: inputValue,
      time: `${formattedStartTime} - ${formattedEndTime}`,
      newStartTime: formatDateToISO(startTime),
      newEndTime: formatDateToISO(endTime)
    }
    onSave(changedItem)
    onClose()
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{ minHeight: 100, padding: 20, position: "relative" }}>
            <Text style={styles.message}>{message}</Text>
            {type === "edit" && (
              <View style={{display:"flex", gap:30,}}>
                <TextInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  style={styles.input}
                  placeholder="Edit title..."
                />
                <View style={styles.timeContainer}>
                  <View style={styles.timePickerContainer}>
                    <Text>From</Text>
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      onChange={(event, selectedDate) => setStartTime(selectedDate || startTime)}
                    />
                  </View>
                  <View style={styles.timePickerContainer}>
                    <Text>Until</Text>
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      onChange={(event, selectedDate) => setEndTime(selectedDate || endTime)}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
          <View style={styles.options}>
            {type === "delete" && (
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.deleteOption}>Delete</Text>
              </TouchableOpacity>
            )}
            {type === "edit" && (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveOption}>Save</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeOption}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  timeContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timePickerContainer: {
    display:"flex",
    gap:10,
    alignItems:"center",
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
  saveOption: {
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
    width: "100%",
    height: 90,
    borderRadius: 10,
  },
})

export default DynamicModal
