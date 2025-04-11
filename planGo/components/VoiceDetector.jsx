import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import Avatar from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import Voice from '@react-native-voice/voice';
import { useVoiceCommandMutation } from '../store/attractionsApi';
import VoiceDeleteModal from './helper-components/VoiceDeleteModal';
import VoiceCreateModal from './helper-components/VoiceCreateModal';

const ExpandingCircle = () => {
  const [circles, setCircles] = useState([]);
  
  useEffect(() => {
    const newCircles = [];
    for (let i = 0; i < 5; i++) {
      const scale = new Animated.Value(0);
      newCircles.push(scale);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1, 
            duration: 1000 + i * 500, 
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 4,
            duration: 1000 + i * 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    setCircles(newCircles);
  }, []);

  return (
    <View style={styles.container}>
      {circles.map((scale, index) => (
        <Animated.View
          key={index}
          style={[
            styles.circle,
            {
              transform: [{ scale }],
              opacity: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};
const VoiceDetector = () => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processCommand] = useVoiceCommandMutation();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [tripsToDelete, setTripsToDelete] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [tripToCreate, setTripToCreate] = useState({});

  useEffect(() => {
    Voice.onSpeechStart = () => {};
    Voice.onSpeechResults = (event) => {
      const text = event.value[0];
      setRecognizedText(text);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const sendCommandToBackend = async (text) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const response = await processCommand(text).unwrap();
      if (response.action?.delete) {
        setTripsToDelete(response.action?.trips);
        setIsDeleteModalVisible(true); 
      } else if (response.action?.create) {
        setTripToCreate(response.action?.trip);
        setIsCreateModalVisible(true);
      } else {
        Alert.alert("Response", response.message);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while processing the command.");
    } finally {
      setIsLoading(false);
      setRecognizedText('');
    }
  };

  const startListening = async () => {
    try {
      setRecognizedText('');
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      await sendCommandToBackend(recognizedText);
    } catch (error) {
      setIsListening(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };
  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      {!isListening && (
        <View style={styles.commandContainer}>
          <Text style={styles.commandInfo}>
            Tap the Avatar to start giving a voice command.
          </Text>
          <Text style={styles.commandInfo}>
            Create Trip{"\n"} mention the city name along with "starting from" and "ending in".
          </Text>
          <Text style={styles.commandInfo}>
            Delete Trip{"\n"}Mention the city name along with "starting from" date.
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={isListening ? stopListening : startListening}
        style={[styles.avatarButton, !isListening ? {bottom: 200} : {bottom: ""}]}
      >
        <Avatar name='aliwangwang' color='white' size={80} />
      </TouchableOpacity>

      {recognizedText && !isListening && !isLoading && (
        <Text style={styles.recognizedText}>{recognizedText}</Text>
      )}

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loaderText}>Processing your command...</Text>
        </View>
      )}
      {isDeleteModalVisible && (
        <VoiceDeleteModal trips={tripsToDelete} visible={isDeleteModalVisible} onClose={closeDeleteModal} />
      )}
      {isCreateModalVisible && (
        <VoiceCreateModal trip={tripToCreate} visible={isCreateModalVisible} onClose={closeCreateModal} />
      )}
      {isListening && (
        <View>
          <ExpandingCircle />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  avatarButton: {
    position:"absolute",
    zIndex: 2,
  },
  commandContainer: {
    position:"absolute",
    top: 100,
    width: "80%",
  },
  commandInfo: {
    fontSize: 20,
    color:"#3B3B3B",
    fontWeight: "bold",
    marginBottom: 40,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },
  recognizedText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    zIndex: 1,
    width: 400,
    height: 400,
    borderRadius: 300,
    backgroundColor: '#4facfe',
  },
});

export default VoiceDetector;
