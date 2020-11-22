import * as actionTypes from './actionTypes'

const reducer = (state, action) => {
    switch (action.type) {
      case actionTypes.INCREASE_COUNT: {
        return {
          ...state,
          count: state.count + 1
        }
      };
      case actionTypes.DESCREASE_COUNT: return {
        ...state,
        count: state.count - 1
      }
      default: {
        return {
          ...state
        }
      };
    }
  };

export default reducer;