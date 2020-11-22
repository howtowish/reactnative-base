import React, {
    Component, memo, useRef, useImperativeHandle, forwardRef, useState
} from 'react';
import {
    Animated, TouchableOpacity, View, Text
} from 'react-native';
const Spacing = {
    S: 8,
    M: 12,
    L: 16
}

const animation = (typeAnimation, value) => {
    const obj = {
        floating: {
            key: 'floating',
            style: {
                bottom: value,
            },
            classAnimation: new Animated.Value(-150)
        },
        opacity: {
            key: 'opacity',
            style: {
                opacity: value,
                top: 10
            },
            classAnimation: new Animated.Value(0)
        }
    };
    return obj[typeAnimation];
};
// eslint-disable-next-line react/display-name
const CustomToast = forwardRef(({
    fromScreen, navigator, style, typeAnimation = 'floating', reverse, content = ''
}, ref) => {
    const animationValue = useRef(animation(typeAnimation)?.classAnimation);
    const isShowButton = useRef(false);
    const [state, setState] = useState({
        isShowing: false,
        description: ''
    });

    useImperativeHandle(ref, () => ({
        show
    }));

    const show = ({ description }) => {
        setState({
            ...state,
            isShowing: true,
            description
        });

        if (!isShowButton.current) {
            isShowButton.current = true;
            switch (typeAnimation) {
            case 'floating':
                animationFloating();
                break;
            case 'opacity':
                animationOpactity();
                break;
            default:
                animationFloating();
                break;
            }
        }
    };

    const finishedAnimation = () => {
        isShowButton.current = false;
        setState({
            ...state,
            isShowing: false,
        });
    };

    const animationOpactity = () => {
        Animated.timing(
            animationValue.current,
            {
                toValue: 1,
                duration: 250,
            }
        ).start(() => {
            setTimeout(() => {
                Animated.timing(
                    animationValue.current,
                    {
                        toValue: 0,
                        duration: 250,
                    }
                ).start(finishedAnimation);
            }, 1000);
        });
    };

    const animationFloating = () => {
        Animated.timing(
            animationValue.current,
            {
                toValue: 10,
                duration: 3000,
            }
        ).start(() => {
            if (reverse) {
                Animated.timing(
                    animationValue.current,
                    {
                        toValue: -150,
                        duration: 500,
                    }
                ).start(finishedAnimation);
            }
        });
    };

    const onPressMore = () => {
        // Do something
    };
    const renderToastWishList = () => (
        <View style={[styles.buttonScrollUpContainer, { backgroundColor: '#404040', height: 36 }]}>
            <Text.Title style={{
                marginLeft: Spacing.S, color: '#ffffff'
            }}
            >
                {state?.description}
            </Text.Title>
            {/* <View style={{ width: 1, height: 20, backgroundColor: '#ffffff' }} />
            <TouchableOpacity
                onPress={onPressMore}
                style={{ }}
            >
                <Text.Title style={{ color: '#ffffff', fontWeight: 'bold' }}>{strings.showMore}</Text.Title>
            </TouchableOpacity> */}
        </View>
    );
    return (
        <Animated.View
            style={[{
                position: 'absolute',
                left: 0,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: Spacing.S,
                paddingBottom: Spacing.L,

            }, style, { ...animation(typeAnimation, animationValue.current)?.style }]}
        >
            {state?.isShowing === true ? renderToastWishList() : null}
        </Animated.View>
    );
});

export default memo(CustomToast);

const styles = {
    buttonScrollUpContainer: {
        paddingHorizontal: Spacing.M,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.S,
        borderRadius: 8,
        borderColor: 'transparent',
        borderWidth: 1,
        backgroundColor: '#ffffff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
};
