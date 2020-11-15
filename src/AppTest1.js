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
import { useDispatch, useSelector } from './react-hook/index'

const AppTest1 = () => {
  const state = useSelector('count');
  const dispatch = useDispatch()
  console.log('test1', state)
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={{ marginTop: 100}} onPress={() => {dispatch({ type: 'increment' })}}>
        <Text>12</Text>
      </TouchableOpacity>
    </>
  );
};

export default AppTest1;
