import useContext from './useContext.js';

const {useContextSelector, StateContext} = useContext;

const useSelector = (keyValue) => useContextSelector(StateContext, (v) => v[0][keyValue]);

export default useSelector;
