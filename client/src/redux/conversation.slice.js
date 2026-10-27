import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    activeId: null,
  },
  reducers: {
    setConversation: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations = [
        action.payload,
        ...state.conversations.filter(
          (conversation) => conversation.id !== action.payload.id,
        ),
      ];
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== action.payload,
      );
    },
    updateConversationTitle: (state, action) => {
      const { id, title } = action.payload;
      const conversation = state.conversations.find((item) => item.id === id);
      if (conversation) conversation.title = title;
    },
    setActiveConversationId: (state, action) => {
      state.activeId = action.payload;
    },
    clearConversationState: (state) => {
      state.conversations = [];
      state.activeId = null;
    },
  },
});

export const {
  setConversation,
  addConversation,
  removeConversation,
  updateConversationTitle,
  setActiveConversationId,
  clearConversationState,
} = conversationSlice.actions;
export default conversationSlice.reducer;