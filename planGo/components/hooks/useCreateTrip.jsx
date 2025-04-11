import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAttractionsInTrip } from "../../store/slices/tripSlice";
import { useCreateTripMutation } from "../../store/attractionsApi";

export const useCreateTrip = () => {
    const dispatch = useDispatch();
    const [createTrip] = useCreateTripMutation();
    const { currentUser } = useSelector((state) => state.user);
    const selectedAttractions = useSelector((state) => state.trip.currentTrip.route);
    const currentTrip = useSelector((state) => state.trip.currentTrip);
  
    const handleCreateTrip = (imageUrl, cityCoordinates, route) => {
   
      if (Object.keys(selectedAttractions).length > 0) {
        dispatch(setSelectedAttractionsInTrip(Object.values(selectedAttractions)));
      }
  
      setTimeout(() => {
        const objectToPass = {
          place_name: currentTrip.placeName,
          place_img: imageUrl ?? "",
          city_coordinates: cityCoordinates,
          date_to: route.toDate,
          date_from: route.fromDate,
          origin_point: currentTrip.originPoint,
          user_id: currentUser.id,
          route: currentTrip.route,
        };
  
        createTrip(objectToPass)
          .unwrap()
          .then(() => {
            Alert.alert("Success", "Congratulations, your trip has been successfully created.");
          })
          .catch((error) => {
            Alert.alert("Error", "There was an error while creating your trip.");
          });
      }, 300);
    };
  
    return { handleCreateTrip };
};
