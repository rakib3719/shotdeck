import { base_url } from "@/utils/utils";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: base_url }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/user/' 
    })
  })
});

export const { useGetUsersQuery } = usersApi;