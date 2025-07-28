import { createSlice } from '@reduxjs/toolkit';
import { fetchSessions, createSession, fetchSession, updateSession, generateComponent } from '../thunks';

const initialState = {
  sessions: [],
  currentSession: null,
  loading: false,
  creating: false,
  error: null,
  
  // Current session data
  chat: [],
  code: {
    jsx: '',
    css: '',
  },
  
  // AI generation state
  generating: false,
  generationError: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Current session management
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      state.chat = action.payload.chat || [];
      state.code = action.payload.code || { jsx: '', css: '' };
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.chat = [];
      state.code = { jsx: '', css: '' };
    },

    // Chat management
    addChatMessage: (state, action) => {
      state.chat.push(action.payload);
    },
    setChatMessages: (state, action) => {
      state.chat = action.payload;
    },

    // Code management
    updateCode: (state, action) => {
      state.code = { ...state.code, ...action.payload };
    },
    setCode: (state, action) => {
      state.code = action.payload;
    },

    // Error management
    clearError: (state) => {
      state.error = null;
      state.generationError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
        state.error = null;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create session
      .addCase(createSession.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.creating = false;
        state.sessions = [action.payload, ...state.sessions];
        state.currentSession = action.payload;
        state.chat = action.payload.chat || [];
        state.code = action.payload.code || { jsx: '', css: '' };
        state.error = null;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Fetch session
      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.chat = action.payload.chat || [];
        state.code = action.payload.code || { jsx: '', css: '' };
        state.error = null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update session
      .addCase(updateSession.fulfilled, (state, action) => {
        // Update the session in the list
        const index = state.sessions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        // Update current session if it's the same
        if (state.currentSession && state.currentSession._id === action.payload._id) {
          state.currentSession = action.payload;
        }
      })
      // Generate component
      .addCase(generateComponent.pending, (state) => {
        state.generating = true;
        state.generationError = null;
      })
      .addCase(generateComponent.fulfilled, (state, action) => {
        state.generating = false;
        state.code = { jsx: action.payload.jsx || '', css: action.payload.css || '' };
        state.generationError = null;
      })
      .addCase(generateComponent.rejected, (state, action) => {
        state.generating = false;
        state.generationError = action.payload;
      });
  },
});

export const {
  setCurrentSession,
  clearCurrentSession,
  addChatMessage,
  setChatMessages,
  updateCode,
  setCode,
  clearError,
} = sessionSlice.actions;

export default sessionSlice.reducer;
