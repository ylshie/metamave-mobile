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
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';
import Copy from './copy.svg'

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
  const Title = ({title}: {title: string}) => (
    <Text style={{
      color: '#494965',
      fontSize: 20,
      fontWeight: '600',
    }}>{title}</Text>
  )
  const SubTitle = ({title}: {title: string}) => (
    <Text style={{
      color: '#686868',
      fontSize: 12,
      fontWeight: '500',
    }}>{title}</Text>
  )
  const Input = ({hint}:{hint: string}) => (
    <LinearGradient 
            colors={['#FFFFFF', '#E4E9F5']}
            style={{
              width: '100%',
              height: 38,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderStyle: 'solid', 
              borderColor: '#B7B7B7',
              borderRadius: 5,
              padding: 0,
            }}
        >
          <TextInput 
              placeholder={hint}
              style={{
                width: '80%',
                fontSize: 11,
                lineHeight: 13,
              }}
          />
          <Copy name='copy' width={20} height={20}/>
          <Text style={{
            color: '#3281EC',
            fontSize: 12,
            fontWeight: '500',
          }}>貼上</Text>
        </LinearGradient>
  )
  const Next = () => (
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
      下一步
      </Text>
    </View>
  )
  const Footer = () => (
    <View style={{
      width: '100%',
      flexDirection: 'row',
    }}>
      <Text style={{
        width: '38%'
      }}>&nbsp;</Text>
      <Text style={{
        width: '40%',
        color: '#000000',
        fontSize: 12,
        fontWeight: '500',
      }}>我沒收到信箱驗證?</Text>
      <Text style={{
        width: '22%',
        color: '#3281EC',
        fontSize: 12,
        fontWeight: '500',
      }}>再寄一次</Text>
    </View>
  )
  return (
    <BottomSheet ref={sheetRef}>
      <View style={{
        left: '5%',
        width: '90%',
        ...styles.actionsContainer
      }}>
        <View style={{
          width: '100%',
          marginBottom: 30,
        }}>
          <Title title='安全驗證'/>
          <SubTitle title='信箱驗證 jelly****@gmail.com'/>
          <Input hint='輸入信箱驗證碼'/>
        </View>

        <View style={{
          width: '100%',
          marginBottom: 10,
        }}>
          <Title title='2FA驗證碼'/>
          <SubTitle title='谷歌驗證 Wezan:(jell******@gmail.com)'/>
          <Input hint='輸入生成的驗證碼'/>
        </View>
        
        <Next/>
        <Footer/>
      </View>
    </BottomSheet>
  );
};

export default WeActions;
