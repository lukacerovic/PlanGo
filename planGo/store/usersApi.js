import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const usersApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000", }),
  endpoints: (builder) => ({
    createUser: builder.mutation({
        query: (userData) => ({
          url: "/users/",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: userData,
        }),
    }),
    loginUser: builder.mutation({
      query: (loginData) => ({
        url: "/login/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: loginData,
      }),
    }),
    updateUser: builder.mutation({
      query: ({ user_id, ...userData }) => ({
        url: `/users/${user_id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: userData,
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
})


export const { useCreateUserMutation, useLoginUserMutation, useUpdateUserMutation, useDeleteUserMutation } = usersApi
export const updatedCurrentUser = usersApi.endpoints.updateUser.matchFulfilled

