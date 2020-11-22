import * as actionTypes from './actionTypes'

export const increaseCount = ({ dispatch, payload }) => dispatch({
    type: actionTypes.INCREASE_COUNT
})

export const discreaseCount = ({ dispatch, payload }) => dispatch({
    type: actionTypes.DESCREASE_COUNT,
})