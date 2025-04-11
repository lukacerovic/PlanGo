import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/FontAwesome"

function CreateTrip() {
  const navigation = useNavigation();
  const [placeName, setPlaceName] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const onChangeFromDate = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setFromDate(currentDate);
  };

  const onChangeToDate = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setToDate(currentDate);
  };
  
  const handleNavigatePlan = () => {
    if (placeName.trim() && fromDate && toDate) {
      navigation.navigate('HomeStack', {
        screen: 'TripScheduling',
        params: {
          placeName: placeName,
          fromDate: fromDate,
          toDate: toDate,
        },
      });
    } else {
      Alert.alert('Please fill in all fields before proceeding');
    }
  }
  return (
    <View style={styles.container}>
        <Image
            source={require("../assets/img/planet.png")}
            style={styles.planet}
        />
        <View style={styles.form}>
            <View>
                <Text style={styles.title}>Where To Go</Text>
                <TextInput style={styles.input} value={placeName} onChangeText={setPlaceName} placeholder='Enter a city ....'/>
            </View>
            <View style={styles.fromToContainer}>
              <View style={styles.formTo}>
                <Text style={styles.title}>From</Text>
                <DateTimePicker
                  testID="fromDatePicker"
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={onChangeFromDate}
                  textColor="#181818"
                  accentColor="#181818"
                  style={{ backgroundColor: '#fff', borderRadius: 5, justifyContent: 'center', alignItems: 'center'}} 
                />
              </View>

              <View style={styles.formTo}>
                <Text style={styles.title}>To</Text>
                <DateTimePicker
                  testID="toDatePicker"
                  value={toDate}
                  mode="date"
                  onChange={onChangeToDate}
                  textColor="#181818"
                  accentColor="#181818"
                  style={{ backgroundColor: '#fff', borderRadius: 5, justifyContent: 'center', alignItems: 'center'}} 
                  />
              </View>
            </View>
            <View>
              <TouchableOpacity 
                style={styles.button}
                onPress={handleNavigatePlan}
              >
                <Text style={{fontSize:20}}>Plan Trip</Text>
                <Icon name="location-arrow" size={20} color="black" />
              </TouchableOpacity>
            </View>
        </View>
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#060811',
    paddingBottom: 80,
  },
  planet: {
    marginTop: 35,
    width: windowWidth / 1.05,
    height: windowWidth / 1.05,
    resizeMode: "cover",
  },
  form: {
    height: windowHeight / 3,
    width: "90%",
    display:"flex",
    justifyContent: "space-between",
    paddingBottom: 40,
  },    
  fromToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formTo: {
    width: '45%',
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#fff",
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    color:"#fff"
  },
  button: {
    display:"flex", 
    flexDirection: "row",
    justifyContent: "space-between",
    gap:10,
    backgroundColor:"white",
    alignSelf: "flex-end",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 3,
  }
});

export default CreateTrip;
