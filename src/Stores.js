import React from 'react';
import { StateProvider } from './react-hook'
export const initialState = {
    count: 0
  };
  
export const reducer = (state, action) => {
    switch (action.type) {
      case 'increment': {
        console.log(state.count)
        return {
          ...state,
          count: state.count + 1
        }
      };
      case 'decrement': return state.count - 1;
      case 'set': return action.count;
      default: {
        return {
          ...state
        }
      };
    }
  };
const Stores = ({ children }) => (
    <StateProvider stores={initialState} reducer={reducer}>
      {children}
    </StateProvider>
)
export {
  StateProvider, Stores
}