import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useLoginUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../store/usersApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../store/slices/userSlice';

const Settings = () => {
    const { currentUser } = useSelector((state) => state.user);
    const { id, email: userEmail, password: userPassword } = currentUser;

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [email, setEmail] = useState(userEmail);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loginUser, { isLoading }] = useLoginUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    const isButtonDisabled = useMemo(() => {
      return email === userEmail && password === "" && confirmPassword === "";
    }, [email, password, confirmPassword, userEmail]);

    const handleUpdate = async () => {
      try {
          updateUser({
              user_id: id,
              email: userEmail === email ? undefined : email,
              password: password || undefined,
          }).unwrap();
          Alert.alert("Success", "Profile updated successfully!");
      } catch (error) {
          Alert.alert("Error", error.data?.msg || "Failed to update profile.");
      }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await deleteUser(id).unwrap();
                            await AsyncStorage.removeItem("token");
                            dispatch(setCurrentUser(null));  
                            Alert.alert("Success", "Your account has been deleted.");
                            navigation.replace("WelcomeScreen");
                        } catch (error) {
                            console.log(error);
                        }
                    } 
                }
            ]
        );
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("rememberMe");

            dispatch(setCurrentUser(null));  
            navigation.replace("WelcomeScreen");
        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Email" 
                placeholderTextColor="#ccc" 
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
              />
              <TextInput 
                placeholder="New Password" 
                placeholderTextColor="#ccc" 
                secureTextEntry 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword}
              />
              <TextInput 
                placeholder="New Confirm Password" 
                placeholderTextColor="#ccc" 
                secureTextEntry 
                style={styles.input} 
                value={confirmPassword} 
                onChangeText={setConfirmPassword}
              />
          </View>
          <View style={[styles.submitButton, isButtonDisabled ? {backgroundColor : "gray"} : {} ]}>
            <TouchableOpacity onPress={handleUpdate} disabled={isButtonDisabled}>
                <Text style={styles.submitText}>{isLoading ? "Loading..." : "Update Changes  →"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.oauthButton, { backgroundColor: "#D10000" }]} 
                onPress={handleLogout}
            >
                <Text style={styles.oauthText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeleteAccount} style={[styles.oauthButton, { backgroundColor: "#970C10" }]}>
                <Text style={styles.oauthText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      width: '90%',
      height: "50%",
      alignItems: 'center',
      justifyContent: "space-between"
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 45,
    },
    inputContainer: {
      width: '100%',
      alignItems: "center",
      alignSelf: "flex-start",
    },
    input: {
      width: '100%',
      height: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 100,
      paddingHorizontal: 15,
      color: '#fff',
      marginBottom: 10,
    },
    submitButton: {
      width: "50%",
      height: 45,
      borderRadius: 50,
      backgroundColor: '#08f',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    submitText: {
      fontSize: 18,
      color: '#fff',
    },
    buttonContainer: {
        width: "100%",
        display:"flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    oauthButton: {
      width: '40%',
      height: 45,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    oauthText: {
      color: '#fff',
    },
});

export default Settings;
