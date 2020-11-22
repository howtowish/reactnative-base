import React from 'react';
import { StateProvider, useDispatch, useSelector } from '../index'  
import reducer from './reducer'
import stores from './stores'
import * as actions from './actions'
const Stores = ({ children }) => (
    <StateProvider stores={stores} reducer={reducer}>
      {children}
    </StateProvider>
)
export {
  StateProvider, Stores, useDispatch, actions, useSelector
}