/* eslint-disable import/no-cycle */
import {
    useState, useEffect, useRef, useCallback
} from 'react';
import {
    isEmpty, get, isArray, has, isFunction
} from 'lodash';
import { useDeepMemo, useDidMount } from 'use-hook-kits';
import {
    useSelector, keySelector, actions, useDispatch
} from '../context';
import * as Services from '../services';
import {
    utils,
    constants,
    global,
    strings
} from '../assets';

const apiList = (key, {
    effect,
    stores,
    isDiscount,
    partnerCode
}) => {
    const obj = {
        homeTopMerchant: {
            type: constants.listType.homeTopMerchant,
            dataType: 'merchants',
            requestFuncType: 'getMerchant',
            customParams: { rowNumber: 7 }
        },
        productOftenBuy: {
            type: constants.listType.productOftenBuy,
            dataType: 'products',
            requestFuncType: 'getProductFrequentBought',
            customParams: { }
        },
        tabHistory: {
            type: constants.listType.tabHistory,
            dataType: 'ordereds',
            requestFuncType: 'getOrderManagement',
            customParams: { }
        },
        tabOrdering: {
            type: constants.listType.tabOrdering,
            dataType: 'ordereds',
            requestFuncType: 'getOrderManagement',
            customParams: { }
        },
        wishlist: {
            type: constants.listType.wishlist,
            dataType: 'wishlist',
            requestFuncType: 'getWishList',
            customParams: { }
        },
        category: {
            type: constants.listType.category,
            dataType: effect.isFilter ? 'merchants[0].products' : isDiscount ? 'discount' : 'products',
            requestFuncType: effect.isFilter ? 'getProductFilter' : 'getProduct',
            customParams: {
                isDiscount,
                storeIds: stores?.map((item) => item.id) || [],
                partnerCode
            }
        },
        discountAll: {
            type: constants.listType.category,
            dataType: effect.isFilter ? 'merchants[0].products' : isDiscount ? 'discount' : 'products',
            requestFuncType: effect.isFilter ? 'getProductFilter' : 'getProduct',
            customParams: {
                isDiscount,
                storeIds: stores?.map((item) => item.id) || [],
                partnerCode
            }
        }
    };
    return obj[key] ? obj[key] : {};
};

export const useProductApi = ({
    params = {}, type = '', isFirstEffect = true, navigator
}) => {
    const isDiscount = type === constants.listType.discountAll;
    const dispatch = useDispatch();
    const services = useSelector(keySelector.services);
    const addressContext = useSelector(keySelector.address);
    const discount = isDiscount ? useSelector(keySelector.discount) : [];
    const user = useSelector(keySelector.user);
    const isScrollBegin = useRef(false);
    const isRendered = useRef(isFirstEffect);
    const eventOffsetCache = useRef(0);
    const [effect, setEffect] = useState(params);
    const merchantRequest = useSelector(keySelector.merchantRequest);
    const { partnerCode, stores } = merchantRequest || {};
    const cart = useSelector(`${keySelector.cart}${partnerCode}`) || [];
    const wishlist = useSelector(`${keySelector.wishlist}${partnerCode}`) || [];
    const reloadApi = useSelector(keySelector.reloadApi);

    const [state, setState] = useState({
        isHasMore: true,
        isSkeleton: false,
        isLoadMore: false,
        product: [],
        filter: { id: 0, name: strings.defaultString }
    });
    const isFinishedCallApi = useRef(true);
    const dataInCart = useDeepMemo(() => utils.getProductQuantity(cart, state.product, wishlist), [cart, wishlist, state.product, global.productWishlist[partnerCode]]);
    useEffect(() => {

        const getProduct = ({
            isMore = false,
            address = isEmpty(addressContext.selected) ? addressContext.default : addressContext.selected,
            eventOffset = 0,
        }) => {

            if (!isRendered.current) {
                isRendered.current = true;
                return;
            }

            if (!isMore) setState((prev) => ({ ...prev, isSkeleton: true }));

            const defaultParam = {
                isMore,
                address,
                eventOffset,
                ...effect
            };
            callApi({
                ...defaultParam,
                dataType: apiList(type, { effect, stores, isDiscount, partnerCode }).dataType,
                requestFuncType: apiList(type, { effect, stores, isDiscount, partnerCode }).requestFuncType,
                customParams: { ...apiList(type, { effect, stores, isDiscount, partnerCode }).customParams }
            });
        };

        if (isEmpty(state.product)) {
            getProduct({
                isMore: false,
                eventOffset: 0,
            });
        } else if (state.isLoadMore) {

            if (eventOffsetCache.current === state.product.length + 1) return;

            eventOffsetCache.current = state.product.length + 1;
            getProduct({
                isMore: true,
                eventOffset: state.product.length + 1,
            });
        } else if (reloadApi.typeAction === type) {
            getProduct({
                isMore: false,
                eventOffset: 0,
            });
        }
    }, [state.isLoadMore, effect, params.categoryId, params.filterBy, reloadApi]);

    useDidMount(() => {
        if (!isRendered.current) {
            isRendered.current = true;
        }
    });

    const callApi = ({
        address,
        isMore,
        eventOffset,
        requestFuncType = '',
        dataType = '',
        customParams
    }) => {

        if (!has(Services, requestFuncType) || !isFunction(Services[requestFuncType])) return;

        Services[requestFuncType](
            {
                ...effect,
                ...customParams,
                address,
                userId: user.userId,
                eventOffset,
                pageSize: get(services, 'pageSize', []),
            },
            (response) => {
                const result = get(response, dataType, []);
                if (isFirstEffect === false) {
                    if (result && result.length > 0) {
                        Services.trackEvent({ parameters: { action: 'scr_search_success' } });
                    } else Services.trackEvent({ parameters: { action: 'scr_search_notfound' } });
                }

                if (requestFuncType === 'getProduct' && dataType === 'products' && effect.name && !isEmpty(result) && isArray(result) && !isDiscount) {
                    actions.setProductMayForget({ dispatch, payload: { product: result, key: result[0]?.partnerCode, type: constants.listType.clickSearch } });
                }
                eventOffsetCache.current = 0;
                setState((prev) => ({
                    ...prev,
                    product: utils.sortMerchantList({ id: prev.filter.id, data: isMore ? [...prev.product, ...result] : result }),
                    isHasMore: result.length >= 10,
                    isLoadMore: isMore ? false : prev.isLoadMore,
                    isSkeleton: !isMore ? false : prev.isSkeleton
                }));
            }
        );
    };

    const onFilter = useCallback((value, callback) => {
        if (value?.isFilter && isFinishedCallApi.current === true) {
            resetState();
            setEffect((prev) => ({
                ...prev,
                minPrice: value?.minPrice,
                maxPrice: value?.maxPrice,
                isSwitch: value?.isSwitch,
                isFilter: value?.isFilter,
                partnerCode: value?.partnerCode
            }));
            callback && callback(0);
        } else {
            if (isDiscount) Services.trackEvent({ parameters: { action: 'select_sort_scr_promo', value: value.name } });
            else if (isFirstEffect === false) Services.trackEvent({ parameters: { action: 'select_sort_scr_search', value: value.name } });
            else if (type === constants.listType.category) Services.trackEvent({ parameters: { action: 'select_sort_scr_search', value: value.name } });
            setState((prev) => ({
                ...prev,
                product: utils.sortMerchantList({ id: value.id, data: prev.product }),
                filter: value
            }));
        }
    }, []);

    const onMomentumScrollBegin = useCallback(() => {
        isScrollBegin.current = true;
    }, []);

    const onLoadMore = () => {
        const { isLoadMore, isHasMore, product } = state;
        if (isLoadMore || !isHasMore || product.length === 0) return;
        setState((prev) => ({ ...prev, isLoadMore: true }));
    };

    const resetState = useCallback(() => setState({
        isHasMore: true,
        isSkeleton: false,
        isLoadMore: false,
        product: [],
        filter: { id: 0, name: strings.defaultString }
    }), []);

    const onCartProduct = useCallback(({ product, typeAction, key }) => {
        global.onCheckWarningMessage({ product, navigator }).then((success) => {
            if (success) {
                actions.setCartData({ dispatch, payload: { product, typeAction, key } });
            }
        });
    });

    return [{ ...state, product: dataInCart, isFilter: effect.isFilter }, {
        setEffect, resetState, onLoadMore, onMomentumScrollBegin, onFilter, onCartProduct
    }];
};

export const useSearchEffect = ({
    navigator, textSearch, resetState, setSearchHeader, setEffect
}) => {
    const services = useSelector(keySelector.services);
    const address = useSelector(keySelector.address);
    const dispatch = useDispatch();
    const merchantRequest = useSelector(keySelector.merchantRequest);
    const { partnerCode } = merchantRequest || {};

    const timerSearch = useRef(null);
    const handleSuggest = useRef(true);
    const [suggestData, setSuggestData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const onSearchText = () => {
            const formatText = utils.removeAlias(textSearch);
            const search = services.suggestion.filter((sug) => utils.removeAlias(sug).includes(formatText)
            );
            setSuggestData(isEmpty(textSearch) ? [] : search);
            setIsSearching(false);
            resetState();
        };
        if (handleSuggest.current && !isEmpty(services?.suggestion)) {
            onSearchText();
        }
    }, [textSearch]);

    const onSuggest = (value, isNotShowSuggest) => {
        Services.trackEvent({ parameters: { action: 'click_keyword_scr_search', keyword: value, provider: global.partnerCode } });
        if (isNotShowSuggest) handleSuggest.current = false;
        setSearchHeader && setSearchHeader(value);
        setEffect((prev) => ({ ...prev, name: value, keyword: value }));
        if (timerSearch.current) clearTimeout(timerSearch.current);
        timerSearch.current = setTimeout(() => {
            setIsSearching(true);
            handleSuggest.current = true;
            timerSearch.current = null;
        }, 200);
    };

    const onPressMerchant = (data) => {
        const params = {
            merchant: data
        };
        if (data && data.partnerCode) {
            global.partnerLogoUrl = data?.partnerLogoUrl;
            global.partnerName = data?.partnerName;
            global.partnerCode = data?.partnerCode;
            actions.setMerchantRequest({ dispatch, payload: { partnerCode: data.partnerCode, stores: data?.products[0]?.stores } });
            params.isMerchant = true;
        }
        global.onGoHome({ navigator, params, address });
    };

    return [{ suggestData, suggestDataOrinal: services?.suggestion || [], isSearching }, { onSuggest, onPressMerchant }];
};
