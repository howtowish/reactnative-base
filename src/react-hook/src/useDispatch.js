import useContext from './useContext.js';

const { useContextSelector, StateContext } = useContext;

const useDispatch = () => useContextSelector(StateContext, (v) => v[1]);

export default useDispatch;