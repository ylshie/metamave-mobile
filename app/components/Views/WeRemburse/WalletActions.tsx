// Third party dependencies.
import React, { ReactChild, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, TextInput, View } from 'react-native';
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

export interface ParamRemburse {
    day: number, 
    stake: Stake,
    callback?: (value: number)=>void | undefined
}
const WeActions = () => {
  const { styles } = useStyles(styleSheet, {});
  const sheetRef = useRef<BottomSheetRef>(null);
  const { navigate } = useNavigation();
  const route = useRoute()
  const chainId = useSelector(selectChainId);
  //const ticker = useSelector(selectEvmTicker);
  //const dispatch = useDispatch();
  const { trackEvent, createEventBuilder } = useMetrics();
  const { title, foot, notify, wait, ready} = route.params as {
    title: string, 
    foot: string,
    wait:  {title: string, foot: string, icon: React.JSX.Element}
    ready: {title: string, foot: string, icon: React.JSX.Element}
    notify?: ()=>Promise<void> | undefined
  }
  const win = Dimensions.get('window');
  const [value, setValue] = useState('')
  const [head, setHead] = useState(title)
  const [note, setNote] = useState(foot)
  const [icon, setIcon] = useState( <Image style={{
                                            left: win.width * 0.01,
                                            width: win.width * 0.6,
                                          }}
                                          resizeMode={'contain'}
                                          source={require('./verify.png')} 
                                    />)
  
  async function run() {
    if (! notify) return
    await notify()
    //onReceive()
    if (ready) {
      setHead(ready.title)
      setNote(ready.foot)
      setIcon(ready.icon)
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
    const { stake, callback } = route.params as ParamRemburse
    const token   = await StorageWrapper.getItem('accessToken');
    const amount  = parseInt(value)
    const total   = Total()
    
    if (amount > total) {
      Alert.alert('Error', 'amount can not be larger than total')
      return
    }
    
    const res = await wzRemoveStake(token, stake.sid, amount)
    console.log('wzRemoveStake', res)
    closeBottomSheetAndNavigate(
      callback? ()=>callback(amount): ()=>{}
    )
  }
  const Total = () => {
    const { stake } = route.params as ParamRemburse
    return stake.reward? (stake.amount+stake.reward): stake.amount
  }
  
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
          marginTop: 10,
        }}>積分贖回</Text>
        <View style={{
          left: '5%',
          width: '90%',
        //borderWidth: 1,
        //borderStyle: 'solid', 
        //borderColor: '#B7B7B7',
        //borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
        }}>
          <Text style={{
            width: '100%',
            color: '#686868',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'left',
          }}>贖回總額</Text>
          <LinearGradient 
            colors={['#FFFFFF', '#E4E9F5']}
            style={{
              width: '100%',
              borderColor: '#B7B7B7',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
            }}
          >
            <View>
              <TextInput 
                style={{
                  color: '#000000',
                  fontSize: 14,
                  fontWeight: '400',
                }} 
                placeholder={'最小值0'}
                value={value}
                onChangeText={setValue}
                keyboardType='numeric'/>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={()=>setValue(`${Total()}`)}
            >
              <Text style={{
                color: '#3281EC',
                fontSize: 14,
                fontWeight: '500',
              }}>wPoint</Text>
              <Text style={{
                color: '#D9A70F',
                fontSize: 14,
                fontWeight: '500',
              }}>最大值</Text>
            </TouchableOpacity>
          </LinearGradient>
          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
          }}>
            <Text style={{
              color: '#686868',
              fontSize: 14,
              fontWeight: '500',
            }}>可贖回積分</Text>
            <Text style={{
              color: '#686868',
              fontSize: 14,
              fontWeight: '500',
            }}>{Total()}</Text>
          </View>
          <Text style={{
            width: '100%',
            color: '#686868',
            fontSize: 12,
            fontWeight: '500',
            textAlign: 'left',
            marginTop: 10,
          }}>
            每天可最多贖回積分10,000 wPoints，贖回金額將於T+1天後到帳
            定期質押僅於到期日後T+1後自動贖回無須手動操作
          </Text>
        </View>
        <View style={{
                      left: '10%',
                      width: '80%',
                      backgroundColor: '#264C98',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
        >
          <TouchableOpacity
            onPress={onPressConfirm}
            containerStyle={{
              width: '100%',
            }}
          >
            <Text style={{
              color: '#FFFFFF',
              width: '100%',
              textAlign: 'center',
              fontSize: 14, 
              fontWeight: '500',
              padding: 5,
            }}>
            確認
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

export default WeActions;
