import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useCreateUserMutation } from "../../store/usersApi";
import { useValidateRegistration } from "../helper/validateRegistration"; 
import { useNavigation } from "@react-navigation/native";

const UserRegistration = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "Select Gender",
  });

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const isRegistrationValid = useValidateRegistration(formData);

    if (!isRegistrationValid) {
      return;
    }
  
    try {
      const userData = {
        name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        password: formData.password,
      };

      await createUser(userData).unwrap().then(() => {
        navigation.navigate("HomeStack");
        Alert.alert("Success", "User registered successfully!");
      });
      
    } catch (error) {
      Alert.alert("Error", "Failed to register user.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{width: "83%", height:"90%", backgroundColor: "#2e3135", borderBottomLeftRadius: 50, padding:0, position:"relative"}}>
        <View style={{backgroundColor:"#fff", height:"20%", display:"flex", alignItems:"center", justifyContent:"center", borderBottomLeftRadius: 40}}>
          <Text style={styles.title}>Registration</Text>
        </View>

        <View style={styles.blackContainer}>
          <View style={styles.negativeBorder}></View>
          <View style={styles.inputDoubleContainer}>
            <View style={{ width: "45%" }}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.inputText}
                value={formData.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
              />
            </View>
            <View style={{ width: "45%" }}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.inputText}
                value={formData.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.inputText}
              value={formData.email}
              autoCapitalize="none"  
              textContentType="none"
              keyboardType="email-address"
              onChangeText={(text) => handleChange("email", text)}
            />
          </View>

          <View style={styles.inputDoubleContainer}>
            <View style={{ width: "45%" }}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.inputText}
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />
            </View>
            <View style={{ width: "45%" }}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.inputText}
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
              />
            </View>
          </View>

          {/* Custom Dropdown za pol */}
          <View style={styles.inputDoubleContainer}>
            <View style={{ width: "35%" }}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.inputText}
                value={formData.age}
                onChangeText={(text) => handleChange("age", text)}
              />
            </View>
            <View style={[styles.inputContainer, { width: "45%"}]}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(!dropdownVisible)}>
                <Text style={styles.dropdownText}>{formData.gender}</Text>
              </TouchableOpacity>

              {dropdownVisible && (
                <View style={styles.dropdownList}>
                  {["Male", "Female", "Other"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleChange("gender", option);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          
        </View>
      </View>
      

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  blackContainer: {
    borderBottomLeftRadius: 50,
    height: "80%",
    width:"120%",
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    display: "flex",
    justifyContent: "space-between",
    paddingVertical: 55,
    alignItems: "center",
    backgroundColor: "#2e3135",
    position:"relative",
    left: -10,
  },
  title: {
    fontSize: 30,
    textAlign: "right",
    width:"60%",
  },
  inputDoubleContainer:{
    display:"flex",
    flexDirection: "row",
    width:"78%",
    justifyContent: "space-between",
  },
  inputContainer:{
    width:"78%",
  },
  label: {
    color:"white",
    fontSize: 18,
    paddingBottom: 20,
  },
  inputText: {
    borderBottomWidth:1,
    color:"white",
    fontSize: 20,
    borderBottomColor: "#fff",
  },
  dropdown: { backgroundColor: "#fff", padding: 10, borderRadius: 5 },
  dropdownText: { color: "#000" },
  dropdownList: { backgroundColor: "#fff", padding: 5, borderRadius: 5, position: "absolute", top: 50, left: 0, right: 0 },
  dropdownItem: { padding: 10 },
  button: {
    backgroundColor: "#2e3135",
    width: "40%",
    display: "flex",
    borderRadius: 20,
    paddingVertical: 5,
    marginRight: "2%",
    alignSelf: "flex-end",
  },
  buttonText: {
    color:"white",
    textAlign: "center",
    fontSize: 25,
  },
});

export default UserRegistration;
