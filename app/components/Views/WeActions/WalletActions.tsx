// Third party dependencies.
import React, { useCallback, useMemo, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { swapsUtils } from '@metamask/swaps-controller';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// External dependencies.
import BottomSheet, {
  BottomSheetRef,
} from '../../../component-library/components/BottomSheets/BottomSheet';
import {
  selectChainId,
  selectEvmTicker,
} from '../../../selectors/networkController';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { IconName } from '../../../component-library/components/Icons/Icon';
import WalletAction from '../../../components/UI/WalletAction';
import { useStyles } from '../../../component-library/hooks';
import { AvatarSize } from '../../../component-library/components/Avatars/Avatar';
import Routes from '../../../constants/navigation/Routes';
import { getDecimalChainId } from '../../../util/networks';
import { WalletActionsBottomSheetSelectorsIDs } from '../../../../e2e/selectors/wallet/WalletActionsBottomSheet.selectors';

// Internal dependencies
import styleSheet from './WalletActions.styles';
import { useMetrics } from '../../../components/hooks/useMetrics';
//import { QRTabSwitcherScreens } from '../QRTabSwitcher';
import { WalletActionType } from '../../UI/WalletAction/WalletAction.types';
import Text from '../../../component-library/components/Texts/Text';
import { Image } from 'react-native';

const WeActions = () => {
  const { styles } = useStyles(styleSheet, {});
  const sheetRef = useRef<BottomSheetRef>(null);
  const { navigate } = useNavigation();

  const chainId = useSelector(selectChainId);
  //const ticker = useSelector(selectEvmTicker);
  //const dispatch = useDispatch();
  const { trackEvent, createEventBuilder } = useMetrics();
  
  const closeBottomSheetAndNavigate = useCallback(
    (navigateFunc: () => void) => {
      sheetRef.current?.onCloseBottomSheet(navigateFunc);
    },
    [],
  );

  const onReceive = useCallback(() => {
    closeBottomSheetAndNavigate(() => {
      //navigate(Routes.QR_TAB_SWITCHER, {
      //  initialScreen: QRTabSwitcherScreens.Receive,
      //});
      navigate(Routes.WALLET.HOME, {
        screen: Routes.WALLET.TAB_STACK_FLOW,
        params: {
          screen: Routes.WALLET_VIEW,
        },
      });
    });

    trackEvent(
      createEventBuilder(MetaMetricsEvents.RECEIVE_BUTTON_CLICKED)
        .addProperties({
          text: 'Receive',
          tokenSymbol: '',
          location: 'TabBar',
          chain_id: getDecimalChainId(chainId),
        })
        .build(),
    );
  }, [
    closeBottomSheetAndNavigate,
    navigate,
    trackEvent,
    chainId,
    createEventBuilder,
  ]);
  const win = Dimensions.get('window');

  return (
    <BottomSheet ref={sheetRef}>
      <View style={styles.actionsContainer}>
        <Text style={{
          width: '100%',
          textAlign: 'center',
          color: '#494965',
          fontSize: 20,
          fontWeight: '600',
          fontFamily: 'Poppins',
        }}>審核資料</Text>
        <View style={{
          left: '5%',
          width: '90%',
          borderWidth: 1,
          borderStyle: 'solid', 
          borderColor: '#B7B7B7',
          borderRadius: 12,
        //flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image style={{
                  left: win.width * 0.01,
                  width: win.width * 0.6,
                //height: win.width * 0.8,  
                }}
                resizeMode={'contain'}
                source={require('./verify.png')} 
          />
          <View style={{
            height: 20,
          }}></View>
          <Text style={{
            width: '100%',
          //height: 100,
            color: '#DB8100',
            fontSize: 24,
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: 30,
          }}>審核中</Text>
          <Text style={{
            width: '100%',
            color: '#6B7280',
            fontSize: 15,
            fontWeight: '400',
            textAlign: 'center'
          }}>預計審核時間24小時請耐心等候</Text>
        </View>
        <View style={{
          left: '10%',
          width: '80%',
          backgroundColor: '#264C98',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
        }}>
          <Text onPress={onReceive}
          style={{
            color: '#FFFFFF',
            width: '80%',
            textAlign: 'center',
            fontSize: 14, 
            fontWeight: '500',
            padding: 5,
          }}>
          返回首頁
          </Text>
        </View>
        {/*
        <WalletAction
          actionType={WalletActionType.Receive}
          iconName={IconName.Received}
          onPress={onReceive}
          actionID={WalletActionsBottomSheetSelectorsIDs.RECEIVE_BUTTON}
          iconStyle={styles.icon}
          iconSize={AvatarSize.Md}
          disabled={false}
        />
        */}
      </View>
    </BottomSheet>
  );
};

export default WeActions;
