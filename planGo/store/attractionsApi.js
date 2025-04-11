import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"


const FOURSQUARE_API_KEY="fsq3kOZkhiqfkv6yg0moKyz96esK6QAOV1ycxKIA74bRMp4"

export const attractionsApi = createApi({
  reducerPath: "tripApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000", }),
  tagTypes: ["Trips"],
  endpoints: (builder) => ({
    fetchAttractionsInfos: builder.query({
      query: (request) => {
        const apiKey = FOURSQUARE_API_KEY
        if (!apiKey || apiKey.trim() === "") throw new Error("Invalid API key.")
        return {
          url: `https://api.foursquare.com/v3/places/search?near=${request}&categories=16000,13000,10000,12000&sort=POPULARITY&limit=20`,
          method: "GET",
          headers: {
            accept: 'application/json',
            Authorization: `fsq3kOZkhiqfkv6yg0moKyz96esK6QAOV1ycxKIA74bRMp4=`,
          },
        }
      },
      transformResponse: (response) => {
        console.log(response)
        if (response.results) {
          return response.results.map((result) => ({
            name: result.name,
            latitude: result.geocodes?.main?.latitude,
            longitude: result.geocodes?.main?.longitude,
          }))
        }
        return []
      },
    }),
    fetchAttractionImage: builder.query({
      query: (attractionsList) => ({
        url: '/scrape-attractions-img/',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        params: { attractions: JSON.stringify(attractionsList) },
      }),
    }),
    
    fetchAllTrips: builder.query({
      providesTags: ["Trips"],
      query: (userId) => `/trips/?user_id=${userId}`,
    }),
    createTrip: builder.mutation({
      invalidatesTags: ["Trips"],
      query: (tripData) => ({
        url: "/trips/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: tripData, 
      }),
    }),
    searchImage: builder.query({
      query: (placeName) => `/getPlaceImage/${placeName}`,
    }),
    getAttractions: builder.query({
      query: (placeName) => `/getAttractions/${placeName}`,
    }),
    deleteTrip: builder.mutation({
      invalidatesTags: ["Trips"],
      query: (id) => ({
        url: `/trips/${id}`,
        method: 'DELETE',
      }),
    }),
    updateTripRoute: builder.mutation({
      query: ({ tripId, planRoute, dayIndex }) => ({
        url: `/trips/${tripId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: { route: planRoute, dayIndex: dayIndex },
      }),
    }),
    getDirections: builder.query({
      query: ({ start_lat, start_lon, end_lat, end_lon }) => ({
        url: `/getDirections?start_lat=${start_lat}&start_lon=${start_lon}&end_lat=${end_lat}&end_lon=${end_lon}`,
        method: "GET",
      }),
    }),   
    voiceCommand: builder.mutation({
      query: (command) => ({
        url: 'voiceCommand/',
        method: 'POST',
        body: { command },
      }),
    }), 
  }),
})


export const { 
  useFetchAttractionsInfosQuery, 
  useFetchAttractionImageQuery,
  useFetchAllTripsQuery, 
  useCreateTripMutation, 
  useSearchImageQuery,
  useGetAttractionsQuery,
  useDeleteTripMutation,
  useUpdateTripRouteMutation,
  useGetDirectionsQuery,
  useVoiceCommandMutation
} = attractionsApi

export const tripListAreFetched = attractionsApi.endpoints.fetchAllTrips.matchFulfilled
export const tripDeletionFinished = attractionsApi.endpoints.deleteTrip.matchFulfilled
export const tripUpdateFinished = attractionsApi.endpoints.updateTripRoute.matchFulfilled


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// export const attractionsApi = createApi({
//   reducerPath: 'trip',
//   baseQuery: fetchBaseQuery({ baseUrl: 'https://api.foursquare.com/v3/places/search' }),
//   endpoints: (builder) => ({
//     fetchAttractionsInfos: builder.query({
//       query: ({ placeName, apiKey }) => {
//         if (!apiKey || apiKey.trim() === "") throw new Error("Invalid API key.")
        
//         const params = new URLSearchParams({
//           query: placeName,
//           near: placeName,
//           limit: 10,
//         })

//         return {
//           url: `?${params.toString()}`,
//           method: 'GET',
//           headers: {
//             "Authorization": apiKey,
//           },
//         }
//       },
//       transformResponse: (response) => {
//         if (response.results) {
//           return response.results.map((result) => ({
//             name: result.name,
//             latitude: result.geocodes?.main?.latitude,
//             longitude: result.geocodes?.main?.longitude,
//           }))
//         }
//         return []
//       },
//     }),
//   }),
// })

// export const { useFetchAttractionsInfosQuery } = attractionsApi
