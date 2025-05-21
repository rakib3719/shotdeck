import { base_url } from '@/utils/utils';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const shotApi = createApi({
  reducerPath: 'shotApi',
  baseQuery: fetchBaseQuery({ baseUrl: base_url }),
  endpoints: (builder) => ({
    getShots: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams(params).toString();
        console.log(searchParams, 'searchparams');
        return `/shot?${searchParams}`;
      },
    }),

    postShots: builder.mutation({
      query: (shot) => ({
        url: '/shot', 
        method: 'POST',
        body: shot,
      }),
    }),
  }),
});


export const { useGetShotsQuery, usePostShotsMutation } = shotApi;
