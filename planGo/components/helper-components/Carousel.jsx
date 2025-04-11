import React, { useRef } from "react"
import { View, ScrollView, ImageBackground, Dimensions, Text, StyleSheet, TouchableOpacity } from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign"

const { width } = Dimensions.get("window")

const CARD_WIDTH = width * 0.4
const SPACING = 20
const TOTAL_CARD_WIDTH = CARD_WIDTH + SPACING

const CustomCarousel = React.memo(({ data, title, onSelect }) => {
  const scrollRef = useRef(null)

  return (
    <View style={styles.carouselContainer}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={TOTAL_CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((attraction, index) => (
          <View key={index} style={styles.card}>
            {attraction.isSelected && <AntDesign style={styles.checkIcon} name="checkcircle" color={"green"} size={30}/>}
            <TouchableOpacity onPress={() => onSelect(index, attraction)}>
              <ImageBackground source={{uri: attraction.img}} style={styles.image}>
                <View style={styles.textContainer}>
                  <Text style={styles.text}>{attraction.name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          
        ))}
      </ScrollView>
    </View>
  )
})


const styles = StyleSheet.create({
  carouselContainer: {
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "left",
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 15,
    overflow: "hidden",
    marginRight: SPACING,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  textContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 10,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: "white",
    borderRadius: 100,
  }
})

export default CustomCarousel
