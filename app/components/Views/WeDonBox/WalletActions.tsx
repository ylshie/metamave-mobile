// Third party dependencies.
import React, { ReactChild, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { swapsUtils } from '@metamask/swaps-controller';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

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
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Stake } from '../WeSecord';
import { wzRemoveStake } from '../WeSignup/account';
import StorageWrapper from '../../../store/storage-wrapper';
import Ready from './ready.svg'
//import { raw } from '@storybook/react-native';

export interface ParamDonBox {
    title?: string,
    message?: string,
    button: string,
    raw?: ReactNode,
    action?: ()=>void | undefined
}
const WeDonBox = () => {
  const { styles } = useStyles(styleSheet, {});
  const sheetRef = useRef<BottomSheetRef>(null);
  const { navigate } = useNavigation();
  const route = useRoute()
  const chainId = useSelector(selectChainId);
  //const ticker = useSelector(selectEvmTicker);
  //const dispatch = useDispatch();
  const { trackEvent, createEventBuilder } = useMetrics();
  const { title, message, button, raw, action} = route.params as ParamDonBox
  const win = Dimensions.get('window');
  
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
  const onPressConfirm = async () => {
  //const { stake, callback } = route.params as ParamDonBox
  //const token   = await StorageWrapper.getItem('accessToken');
  //await wzRemoveStake(token, stake.sid)
  //closeBottomSheetAndNavigate(
  //  callback? callback: ()=>{}
  //)
    if (action) { action() }
  }
  const Header = ({title}:{title: string}) => (
    <Text style={{
      width: '100%',
      textAlign: 'center',
      color: '#494965',
      fontSize: 20,
      fontWeight: '600',
      fontFamily: 'Poppins',
      marginTop: 10,
    }}>{title}</Text>
  )
  const Message = ({message}:{message: string}) => (
    <Text style={{
      width: '90%',
      color: '#000000',
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    }}>
      {message}
    </Text>
  )
  return (
    <BottomSheet ref={sheetRef}>
      <View style={styles.actionsContainer}>
        {
          title
          ? <Header title={title} />
          : <></>
        }
        <View style={{
          width: '100%',
          padding: 10,
          marginTop: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ready name='ready' width={160} height={160}/>
          {
            raw
            ? raw
            : message
            ? <Message message={message} />
            : <></>
          }
        </View>
        <View
        style={{
          left: '10%',
          width: '80%',
          backgroundColor: '#264C98',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
        }}>
          <TouchableOpacity
            style={{ width: '100%'}}
            onPress={onPressConfirm}>
            <Text style={{
              color: '#FFFFFF',
              width: '100%',
              textAlign: 'center',
              fontSize: 14, 
              fontWeight: '500',
              padding: 5,
            }}>
            {button}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

export default WeDonBox;
