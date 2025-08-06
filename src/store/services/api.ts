import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { environment } from '../../utils/environment';
import { RootState } from '../index';

// Mutex için token refresh mekanizması
const mutex = new Mutex();

// Custom base query with token refresh
const baseQuery: BaseQueryFn<
  {
    url: string;
    method?: string;
    body?: any;
    params?: any;
  },
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  // Token refresh için mutex kullan
  await mutex.waitForUnlock();
  
  let result = await fetchBaseQuery({
    baseUrl: environment.api.baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      return headers;
    },
  })(args, api, extraOptions);

  // Token expired ise refresh et
  if (result.error && result.error.status === 401) {
    // Mutex unlock edildikten sonra tekrar dene
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Burada token refresh logic'i eklenecek
        // Şimdilik sadece error dön
        console.log('Token expired, please login again');
      } finally {
        release();
      }
    }
    
    return result;
  }

  return result;
};

// API slice oluşturma
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: ['Report', 'Alert', 'Satellite', 'User'],
  endpoints: (builder) => ({
    // Reports API
    getReports: builder.query({
      query: ({ bbox, hours = 24 }: { bbox?: string; hours?: number }) => ({
        url: 'reports',
        params: {
          bbox,
          hours,
        },
      }),
      providesTags: ['Report'],
      transformResponse: (response: any[]) => {
        // Response normalization
        return response.map(report => ({
          ...report,
          id: report.id.toString(),
          reportedAt: new Date(report.reportedAt).toISOString(),
        }));
      },
    }),
    
    getReportById: builder.query({
      query: (id: string) => `reports/${id}`,
      providesTags: (result, error, id) => [{ type: 'Report', id }],
    }),
    
    createReport: builder.mutation({
      query: (reportData) => ({
        url: 'reports',
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: ['Report'],
    }),
    
    updateReport: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `reports/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Report', id },
        'Report',
      ],
    }),
    
    deleteReport: builder.mutation({
      query: (id: string) => ({
        url: `reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'],
    }),
    
    // Satellite Data API
    getSatelliteData: builder.query({
      query: ({ bbox, hours = 24 }: { bbox?: string; hours?: number }) => ({
        url: 'satellite/nearby',
        params: {
          bbox,
          hours,
        },
      }),
      providesTags: ['Satellite'],
    }),
    
    // Alerts API
    getAlerts: builder.query({
      query: () => 'alerts',
      providesTags: ['Alert'],
    }),
    
    getAlertById: builder.query({
      query: (id: string) => `alerts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Alert', id }],
    }),
    
    createAlert: builder.mutation({
      query: (alertData) => ({
        url: 'alerts',
        method: 'POST',
        body: alertData,
      }),
      invalidatesTags: ['Alert'],
    }),
    
    // User API
    getUserProfile: builder.query({
      query: () => 'user/profile',
      providesTags: ['User'],
    }),
    
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: 'user/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Authentication API
    refreshToken: builder.mutation({
      query: (refreshToken: string) => ({
        url: 'auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    // Push Notifications
    registerPushToken: builder.mutation({
      query: (tokenData) => ({
        url: 'user/push-token',
        method: 'POST',
        body: tokenData,
      }),
    }),
    
    // Search API
    searchReports: builder.query({
      query: ({ query, bbox, hours }: { query: string; bbox?: string; hours?: number }) => ({
        url: 'reports/search',
        params: {
          query,
          bbox,
          hours,
        },
      }),
      providesTags: ['Report'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useGetSatelliteDataQuery,
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useCreateAlertMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useRefreshTokenMutation,
  useRegisterPushTokenMutation,
  useSearchReportsQuery,
} = apiSlice;