import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the wellknown config
// Matches DaVinci client wellknown config shape
export interface WellknownConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  response_types_supported?: string[];
  scopes_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  claims_supported?: string[];
  [key: string]: any;
}

export interface WellknownState {
  config: WellknownConfig | null; // normalized config
  raw: any | null; // raw wellknown response
  loading: boolean;
  error: string | null;
}

const initialState: WellknownState = {
  config: null,
  raw: null,
  loading: false,
  error: null,
};

export const fetchWellknownConfig = createAsyncThunk<any, string>(
  'wellknown/fetchConfig',
  async (endpoint, { rejectWithValue }) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch wellknown config');
    }
  },
);

const wellknownSlice = createSlice({
  name: 'wellknown',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWellknownConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWellknownConfig.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.raw = action.payload;
        // Optionally normalize here if needed, for now just copy
        state.config = action.payload;
      })
      .addCase(fetchWellknownConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
  selectors: {
    getAuthorizeEndpoint: (state) => state.config?.authorization_endpoint,
  },
});

export { wellknownSlice };
