import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current active tab in code editor
  activeTab: 'jsx',
  
  // UI state for different views
  sidebarCollapsed: false,
  
  // Global loading states
  globalLoading: false,
  
  // Notification/toast state
  notifications: [],
  
  // Modal states
  modals: {
    export: false,
    settings: false,
  },
  
  // Error states
  globalError: null,
  
  // Theme and preferences
  theme: 'light',
  
  // Playground specific UI state
  playground: {
    chatInputValue: '',
    previewLoading: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Tab management
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Global error
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Playground specific
    setChatInputValue: (state, action) => {
      state.playground.chatInputValue = action.payload;
    },
    setPreviewLoading: (state, action) => {
      state.playground.previewLoading = action.payload;
    },
    
    // Reset UI state
    resetUIState: (state) => {
      return initialState;
    },
  },
});

export const {
  setActiveTab,
  toggleSidebar,
  setSidebarCollapsed,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalError,
  clearGlobalError,
  setTheme,
  toggleTheme,
  setChatInputValue,
  setPreviewLoading,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
