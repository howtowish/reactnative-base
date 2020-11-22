/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  Text,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector, actions } from './index'
const AppTest = () => {
  // const state = useSelector('count');
  const dispatch = useDispatch()
  console.log('test')
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={{ marginTop: 100}} onPress={() => actions.discreaseCount({ dispatch })}>
        <Text>123</Text>
      </TouchableOpacity>
    </>
  );
};

export default AppTest;
