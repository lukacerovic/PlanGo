import { createSlice } from '@reduxjs/toolkit'
import { tripListAreFetched, tripDeletionFinished, tripUpdateFinished, directionsAreFetched } from "../attractionsApi" 

const initialState = {
  tripList: [],      
  currentTrip: {},   
  daysRoute: [],
  originPoint: {},
}

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  extraReducers: (builder) => {
    builder.addMatcher(tripListAreFetched, (state, { payload }) => {
      state.tripList = payload
    })
    builder.addMatcher(tripDeletionFinished, (state, { payload: deletedTrip }) => {
      state.tripList.filter((trip) => trip.id === deletedTrip.id)
    })
    builder.addMatcher(tripUpdateFinished, (state, { payload }) => {
      const index = state.tripList.findIndex(trip => trip.id === payload.id);
  
      if (index !== -1) {
        state.tripList[index] = payload;
      }
    })
  },

  reducers: {
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload 
    },
    setSelectedAttractionsInTrip: (state, action) => {
      const { route } = state.currentTrip
      const newAttractions = action.payload.map(({ img, ...rest }) => ({
          ...rest,
          isOrigin: false,
          type: "attraction"
      }))
  
      const areCoordinatesClose = (lat1, lon1, lat2, lon2, threshold = 0.0005) => {
          return Math.abs(lat1 - lat2) < threshold && Math.abs(lon1 - lon2) < threshold
      }

      const filteredNewAttractions = newAttractions.filter((newAttr) => {
          return !route.some((existing) =>
              areCoordinatesClose(existing.latitude, existing.longitude, newAttr.latitude, newAttr.longitude)
          )
      })
  
      state.currentTrip.route = [...route, ...filteredNewAttractions]
    },  
    setDaysRoute: (state, action) => {
      state.daysRoute = action.payload 
    },
    setOriginPoint: (state, action) => {
      state.originPoint = action.payload 
    },
  },
})

export const { setCurrentTrip, setSelectedAttractionsInTrip, setDaysRoute, setOriginPoint } = tripSlice.actions
export default tripSlice.reducer
