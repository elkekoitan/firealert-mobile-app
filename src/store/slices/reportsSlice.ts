
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FireReport } from '../../types';

interface ReportsState {
  reports: FireReport[];
  userReports: FireReport[];
  nearbyReports: FireReport[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  userReports: [],
  nearbyReports: [],
  isLoading: false,
  error: null,
};

// Mock AI Analysis
const generateMockAIAnalysis = (images: string[]) => {
  const confidence = Math.random() * 0.4 + 0.6; // 60-100%
  const detectedElements = ['smoke', 'fire', 'vegetation'];
  const riskLevel = confidence > 0.9 ? 'CRITICAL' : 
                   confidence > 0.8 ? 'HIGH' : 
                   confidence > 0.7 ? 'MEDIUM' : 'LOW';
  
  return {
    confidence: Math.round(confidence * 100),
    detectedElements,
    riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    isLikelyFire: confidence > 0.7,
  };
};

export const createReport = createAsyncThunk(
  'reports/create',
  async (reportData: {
    latitude: number;
    longitude: number;
    images: string[];
    description: string;
    userId: string;
    userName: string;
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiAnalysis = generateMockAIAnalysis(reportData.images);
    
    const newReport: FireReport = {
      id: Date.now().toString(),
      ...reportData,
      aiAnalysis,
      status: 'PENDING',
      reportedAt: new Date().toISOString(),
      emergency112Notified: aiAnalysis.riskLevel === 'CRITICAL',
    };

    return newReport;
  }
);

export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    const mockReports: FireReport[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Test User',
        latitude: 39.9334,
        longitude: 32.8597,
        images: ['https://i.abcnewsfe.com/a/d7a80f18-78b0-4f17-acb5-0cedeef3eb87/canada-fires-20242_1715556479391_hpMain.jpg
        description: 'Ormanda duman görüldü',
        aiAnalysis: {
          confidence: 85,
          detectedElements: ['smoke', 'vegetation'],
          riskLevel: 'HIGH',
          isLikelyFire: true,
        },
        status: 'VERIFIED',
        reportedAt: new Date(Date.now() - 3600000).toISOString(),
        emergency112Notified: true,
      },
    ];

    return mockReports;
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateReportStatus: (state, action: PayloadAction<{
      reportId: string;
      status: FireReport['status'];
    }>) => {
      const report = state.reports.find(r => r.id === action.payload.reportId);
      if (report) {
        report.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.unshift(action.payload);
        state.userReports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Rapor gönderilemedi';
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      });
  },
});

export const { clearError, updateReportStatus } = reportsSlice.actions;
export default reportsSlice.reducer;
