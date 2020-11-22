import React from 'react';
import {
    TouchableOpacity, View, Image, Text
} from 'react-native';
import StepIndicator from './StepIndicator';
import { imgs } from '../assets';
const Spacing = {
    XS: 4,
    S: 8,
    M: 12,
    L: 16,
    XL: 24
}
const Icons = {
    ic_close_gray: imgs.ic_remove,
    ic_selected: imgs.ic_selected
};

const stepIndicatorStyles = {
    stepIndicatorSize: 22,
    currentStepIndicatorSize: 22,
    separatorStrokeWidth: 5,
    currentStepStrokeWidth: 5,
    stepStrokeCurrentColor: '#a60064',
    separatorFinishedColor: '#a60064',
    separatorUnFinishedColor: '#f7dcec',
    stepIndicatorFinishedColor: '#a60064',
    stepIndicatorUnFinishedColor: '#f7dcec',
    stepIndicatorCurrentColor: '#a60064',
    stepIndicatorLabelFontSize: 11,
    currentStepIndicatorLabelFontSize: 11,
    stepIndicatorLabelCurrentColor: '#ffffff',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: '#9da2a6',
    labelColor: '#797c80',
    labelSize: 16,
    currentStepLabelColor: 'black',
    labelAlign: 'flex-start'
};

class OrderState extends React.Component {
    constructor(props) {
        super(props);
        this.data = [];
        this.currentStatus = 0;
        const { data } = this.props;
        if (data && data.process && Array.isArray(data.process) && data.process.length > 0) {
            this.data = [...data.process];
            const currentStatus = data.process.findIndex((item) => (data.status == item.status));
            if (currentStatus) {
                this.currentStatus = currentStatus;
            }
        }
    }

    render() {
        let { width, height, data } = this.props;
        if (!width) {
            width = '100%';
        }

        if (!height) {
            height = '90%';
        }
        return (
            <View style={[{
                width, height, borderRadius: 10, backgroundColor: '#ffffff', paddingLeft: Spacing.XL, paddingBottom: this.data.length == 2 ? '20%' : 0
            }]}
            >
                {this.renderHeader()}
                <StepIndicator
                    customStyles={stepIndicatorStyles}
                    stepCount={this.data.length}
                    direction="vertical"
                    currentPosition={this.currentStatus}
                    labels={this.data}
                />
            </View>
        );
    }

    onPressClose = () => {
        const { close } = this.props;
        if (close && typeof close === 'function') {
            close();
        }
    }

    renderHeader() {
        const { title } = this.props;
        return (
            <View style={styles.containerHeader}>
                <View style={{ width: '5%' }} />
                <Text.H4 style={{ fontWeight: 'bold' }}>{title}</Text.H4>
                <TouchableOpacity style={{ padding: Spacing.XS }} onPress={this.onPressClose}>
                    <Image source={Icons.ic_close_gray} style={{ width: 15, height: 15, resizeMode: 'contain' }} />
                </TouchableOpacity>
            </View>
        );
    }
}

export default OrderState;

const styles = {
    textContentRow: {
        color: '#222222',
        fontSize: 18
    },
    containerRowSelected: {
        backgroundColor: '#edf6fe',
        borderRadius: 8
    },
    containerRow: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: Spacing.S,
        paddingVertical: Spacing.S,
        marginHorizontal: Spacing.S,
        flex: 1
    },
    containerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: Spacing.S,
        marginTop: Spacing.L
    }
};
