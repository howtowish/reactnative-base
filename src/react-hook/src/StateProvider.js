import React, {
    useReducer
} from 'react';
import useContext from './useContext.js';

const { StateContext } = useContext;

const StateProvider = ({ children, reducer, stores, logger}) => (
    <StateContext.Provider value={useReducer(logger ? logger(reducer) : reducer, stores)}>
        {children}
    </StateContext.Provider>
);

export default StateProvider;