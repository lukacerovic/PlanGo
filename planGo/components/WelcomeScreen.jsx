import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useLoginUserMutation } from '../store/usersApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../store/slices/userSlice';

const WelcomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();

  useEffect(() => {
    const checkRememberedUser = async () => {
      const token = await AsyncStorage.getItem("token");
      const rememberMe = await AsyncStorage.getItem("rememberMe");
      const user = await AsyncStorage.getItem("user");

      if (token && rememberMe === "true" && user) {
        dispatch(setCurrentUser({ ...JSON.parse(user), token }));
        navigation.navigate("HomeStack");
      }
    };
    checkRememberedUser();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    };

    try {
      const response = await loginUser({ email, password }).unwrap();
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      dispatch(setCurrentUser({ ...response.user, token: response.token }));

      if (rememberMe) {
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("rememberMe");
      };

      navigation.navigate("HomeStack");
    } catch (error) {
      Alert.alert("Login Failed", error.data?.msg || "Invalid credentials.");
    };
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.glassContainer}>
        <Text style={styles.title}>Welcome to PlanGo</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
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
              placeholder="Password" 
              placeholderTextColor="#ccc" 
              secureTextEntry 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword}
            />
            
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkedCheckbox]} />
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.submitText}>{isLoading ? "Loading..." : "Continue  →"}</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("UserRegistration")}>
            <Text style={styles.signupText}>Sign Up</Text>
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
  glassContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
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
  footerContainer: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    gap:5,
  },
  footerText: {
    color: '#aaa',
  },
  signupText: {
    color: '#0af',
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginVertical: 10, 
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 5, 
    borderWidth: 2, 
    borderColor: '#ccc', 
    marginRight: 10, 
  },
  checkedCheckbox: { 
    backgroundColor: '#08f', 
    borderColor: '#08f', 
  },
  checkboxLabel: { 
    color: '#fff', 
  },
});

export default WelcomeScreen;
