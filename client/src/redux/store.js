import { configureStore } from '@reduxjs/toolkit'
import userSliceReducer from './user.slice.js'
import conversationSliceReducer from './conversation.slice.js'
import messageSliceReducer from './message.slice.js'

export const store = configureStore({
  reducer: {
    user: userSliceReducer,
    conversation: conversationSliceReducer,
    message: messageSliceReducer
  }
})