// Third party dependencies.
import React, { ReactChild, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
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
import { head } from 'lodash';

const WeActions = () => {
  const { styles } = useStyles(styleSheet, {});
  const sheetRef = useRef<BottomSheetRef>(null);
  const { navigate } = useNavigation();
  const route = useRoute()
  const chainId = useSelector(selectChainId);
  //const ticker = useSelector(selectEvmTicker);
  //const dispatch = useDispatch();
  const { trackEvent, createEventBuilder } = useMetrics();
  const { head, title, foot, notify, wait, ready} = route.params as {
    head: string,
    title: string, 
    foot: string,
    wait:  {head: string, title: string, foot: string, icon: React.JSX.Element}
    ready: {head: string, title: string, foot: string, icon: React.JSX.Element}
    notify?: ()=>Promise<{  ok: boolean;
                            tx: any;
                            error?: undefined;
                          } | {
                            ok: boolean;
                            error: unknown;
                            tx?: undefined;
                          }> 
                          | undefined
  }
  const win = Dimensions.get('window');
  const [headx,  setHeadX]  = useState(head)
  const [titlex, setTitleX] = useState(title)
  const [footx,  setFootX]  = useState(foot)
  const [icon, setIcon] = useState( <Image style={{
                                            left: win.width * 0.01,
                                            width: win.width * 0.6,
                                          }}
                                          resizeMode={'contain'}
                                          source={require('./verify.png')} 
                                    />)
  
  async function run() {
    if (! notify) return
    const ret = await notify()
    if (ret?.ok) {
      if (ready) {
        setHeadX(ready.head)
        setTitleX(ready.title)
        setFootX(ready.foot)
        setIcon(ready.icon)
      }
    } else {
      setTitleX("Error occurs")
      setFootX("meet error")
    }
  }
  
  useEffect(() => {
    run()
  }, [notify])
  
  const closeBottomSheetAndNavigate = useCallback(
    (navigateFunc: () => void) => {
      sheetRef.current?.onCloseBottomSheet(navigateFunc);
    },
    [],
  );

  const onReceive = useCallback(() => {
    closeBottomSheetAndNavigate(() => {
      /*
      navigate(Routes.WALLET.HOME, {
        screen: Routes.WALLET.TAB_STACK_FLOW,
        params: {
          screen: Routes.WALLET_VIEW,
        },
      });
      */
      navigate('WeFinance')
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
        }}>{headx}</Text>
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
          {icon}
          <View style={{
            height: 20,
          }}></View>
          <Text style={{
            width: '100%',
            color: '#DB8100',
            fontSize: 24,
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: 30,
          }}>{titlex}</Text>
          <Text style={{
            width: '100%',
            color: '#6B7280',
            fontSize: 15,
            fontWeight: '400',
            textAlign: 'center'
          }}>{footx}</Text>
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
