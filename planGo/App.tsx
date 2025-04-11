import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Awesome from "react-native-vector-icons/FontAwesome";
import Avatar from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './components/HomeScreen';
import Settings from "./components/Settings";
import VoiceDetector from './components/VoiceDetector';
import DayPlan from './components/DayPlan';
import CreateTrip from './components/CreateTrip';
import TripScheduling from './components/TripScheduling';
import EditTodayPlan from './components/EditTodayPlan';
import DayMap from './components/DayMap';
import TripPlanList from './components/TripPlan';
import WelcomeScreen from './components/WelcomeScreen';
import UserRegistration from './components/registration/UserRegistration';
import { setCurrentUser, setIsAuthenticated } from './store/slices/userSlice';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTransparent: true, headerTitle: "" }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TripPlanList" component={TripPlanList} />
      <Stack.Screen name="DayPlan" component={DayPlan} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="TripScheduling" component={TripScheduling} />
      <Stack.Screen name="EditTodayPlan" component={EditTodayPlan} />
      <Stack.Screen name="DayMap" component={DayMap} />
    </Stack.Navigator>
  )
}

const checkRememberMe = async () => {
  const dispatch = useDispatch();
  const rememberMe = await AsyncStorage.getItem("rememberMe");
  const token = await AsyncStorage.getItem("token");

  if (rememberMe && token) {
    dispatch(setCurrentUser({ token }));
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

  useEffect(() => {
    checkRememberMe();
  }, [])


  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e3135" />
      </View>
    )
  }

  return (
      <GestureHandlerRootView style={{ flex: 1 }}> 
        <NavigationContainer>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent={true}
          />
          {isAuthenticated ? (
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: "#fff",
                tabBarStyle: { backgroundColor: 'black', position:"absolute", bottom:0, },
                headerTransparent: true, 
                headerTitle: ""
              }}
            >
              <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Awesome name="home" color={color} size={size * 1.2} />
                  ),
                  title: '',
                }}
              />
              <Tab.Screen
                name="CreateTrip"
                component={CreateTrip}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="travel-explore" color={color} size={size * 1.2}/>
                  ),
                  title: '',
                }}
              />
              <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="person" color={color} size={size * 1.2} />
                  ),
                  title: '',
                }}
              />
              {/* AI text bot */}
              <Tab.Screen
                name="VoiceDetector"
                component={VoiceDetector}
                options={{
                  tabBarIcon: ({ color, size }) => (
                    <Avatar name="aliwangwang" color={color} size={size}/>
                  ),
                  title: '',
                }}
              />

            </Tab.Navigator>
          ) : (
            <Stack.Navigator screenOptions={{ headerTransparent: true, headerTitle: "", headerBackVisible: true }}>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="UserRegistration" component={UserRegistration} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
  )
}

export default App
