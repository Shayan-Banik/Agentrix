import { configureStore } from '@reduxjs/toolkit'
import userSliceReducer from './user.slice.js'

export const store = configureStore({
  reducer: {
    user: userSliceReducer
  }
})