import React, {
    useReducer, memo, useLayoutEffect, createElement, createContext, useRef, useContext
} from 'react';

const LISTENERS = (
    Symbol('LISTENERS')
);

const createProvider = (OrigProvider, listeners) => memo(({ value, children }) => {
    useLayoutEffect(() => {
        listeners.forEach((listener) => {
            listener(value);
        });
    });
    return createElement(OrigProvider, { value }, children);
});

const createContextSelector = (defaultValue) => {
    const context = createContext(defaultValue, () => 0);
    context[LISTENERS] = new Set();
    context.Provider = createProvider(context.Provider, context[LISTENERS]);
    delete context.Consumer;
    return context;
};

const useContextSelector = (context, selector) => {
    const listeners = context[LISTENERS];
    if (!listeners) {
        throw new Error('errors useContextSelector');
    }
    const [, forceUpdate] = useReducer((c) => c + 1, 0);
    const value = useContext(context);
    const selected = selector(value);
    const ref = useRef(null);
    useLayoutEffect(() => {
        ref.current = {
            f: selector,
            v: value,
            s: selected,
        };
    });
    useLayoutEffect(() => {
        const callback = (nextValue) => {
            try {
                if (ref.current.v === nextValue
            || Object.is(ref.current.s, ref.current.f(nextValue))) {
                    return;
                }
            } catch (e) {
                // ignored
            }
            forceUpdate();
        };
        listeners.add(callback);
        return () => {
            listeners.delete(callback);
        };
    }, [listeners]);
    return selected;
};

const StateContext = createContextSelector();

export default {
    createContextSelector,useContextSelector, StateContext, 
}