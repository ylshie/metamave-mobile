/* eslint-disable @typescript-eslint/no-require-imports */
import React, {
  useEffect,
  useRef,
  useCallback,
  useContext,
  ReactNode,
  useState,
} from 'react';
import {
  ActivityIndicator,
  View,
  Linking,
  ImageSourcePropType,
  GestureResponderEvent,
  Alert,
} from 'react-native';

import { connect, useSelector } from 'react-redux';
import { baseStyles } from '../../../styles/common';
import { getPersonaNavbar } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import {
  isPastPrivacyPolicyDate,
  shouldShowNewPrivacyToastSelector,
  storePrivacyPolicyShownDate as storePrivacyPolicyShownDateAction,
  storePrivacyPolicyClickedOrClosed as storePrivacyPolicyClickedOrClosedAction,
} from '../../../reducers/legalNotices';
import { CONSENSYS_PRIVACY_POLICY } from '../../../constants/urls';
import {
  ToastContext,
  ToastVariants,
} from '../../../component-library/components/Toast';
import { AvatarAccountType } from '../../../component-library/components/Avatars/Avatar';
import NotificationsService from '../../../util/notifications/services/NotificationService';
import Engine from '../../../core/Engine';
import { MetaMetricsEvents } from '../../../core/Analytics';
import OnboardingWizard from '../../UI/OnboardingWizard';
import ErrorBoundary from '../ErrorBoundary';
import { useTheme } from '../../../util/theme';
import Routes from '../../../constants/navigation/Routes';
import {
  getDecimalChainId,
} from '../../../util/networks';
import {
  selectChainId,
  selectEvmNetworkConfigurationsByChainId,
  selectNetworkConfigurations,
  selectEvmTicker,
} from '../../../selectors/networkController';
import {
  selectNetworkName,
  selectNetworkImageSource,
} from '../../../selectors/networkInfos';
import {
  selectTransformedTokens,
} from '../../../selectors/tokensController';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import BannerAlert from '../../../component-library/components/Banners/Banner/variants/BannerAlert/BannerAlert';
import { BannerAlertSeverity } from '../../../component-library/components/Banners/Banner';
import Text, {
  TextColor,
} from '../../../component-library/components/Texts/Text';
import { useMetrics } from '../../hooks/useMetrics';
import { RootState } from '../../../reducers';
import { selectSelectedInternalAccount } from '../../../selectors/accountsController';
import {
  hideNftFetchingLoadingIndicator as hideNftFetchingLoadingIndicatorAction,
  showNftFetchingLoadingIndicator as showNftFetchingLoadingIndicatorAction,
} from '../../../reducers/collectibles';
import { WalletViewSelectorsIDs } from '../../../../e2e/selectors/wallet/WalletView.selectors';
import {
  getMetamaskNotificationsUnreadCount,
  getMetamaskNotificationsReadCount,
  selectIsMetamaskNotificationsEnabled,
} from '../../../selectors/notifications';
import { selectIsProfileSyncingEnabled } from '../../../selectors/identity';
import { ButtonVariants } from '../../../component-library/components/Buttons/Button';
import { useAccountName } from '../../hooks/useAccountName';

import useCheckNftAutoDetectionModal from '../../hooks/useCheckNftAutoDetectionModal';
import useCheckMultiRpcModal from '../../hooks/useCheckMultiRpcModal';
import {
  selectNativeEvmAsset,
  selectStakedEvmAsset,
} from '../../../selectors/multichain';
/*----- [Arthur] -----*/
/*--------------------*/
import { Image } from 'react-native';
import { Dimensions } from 'react-native';
import createStyles from './styles';
import LinearGradient from 'react-native-linear-gradient'
import useCopyClipboard from '../Notifications/Details/hooks/useCopyClipboard';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Finance from './images/finance.svg'
import Hand from './images/hand.svg'
import P00 from './images/p00.svg'
import P30 from './images/p30.svg'
import P60 from './images/p60.svg'
import { PointStake } from '../WeFinance';
import { TYPE_0 } from '@walletconnect/utils';
import { BackStep, NextStep } from '../WeStake00/element';
import { Stake } from '../WeSecord';
import { button } from '../../Snaps/SnapUIRenderer/components/button';
import { ParamDonBox } from '../WeDonBox/WalletActions';
import { wzInfo, wzListStake } from '../WeSignup/account';
import StorageWrapper from '../../../store/storage-wrapper';
import { value } from '../../Snaps/SnapUIRenderer/components/value';
import ON from './images/on.svg'
import OFF from './images/off.svg'

/*--------------------*/
 
interface WalletProps {
  navigation: NavigationProp<ParamListBase>;
  storePrivacyPolicyShownDate: () => void;
  shouldShowNewPrivacyToast: boolean;
  currentRouteName: string;
  storePrivacyPolicyClickedOrClosed: () => void;
  showNftFetchingLoadingIndicator: () => void;
  hideNftFetchingLoadingIndicator: () => void;
}
const win = Dimensions.get('window');

const Option = ({icon, title, quota, apr, onPress}:
                {
                  icon: ReactNode, 
                  title: string, 
                  quota: number,
                  apr?: number,
                  onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
                }) => {
  return  <TouchableOpacity
            onPress={onPress}
            style={{
              width: '100%',
              backgroundColor: '#F6F7FB',
              borderRadius: 10,
              borderStyle: 'solid',
              borderColor: '#FFFFFF',
              borderWidth: 1,
              padding: 5,
              flexDirection: 'row',
            }}
          >
            <View style={{
              width: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {icon}
            </View>
            <View style={{
              width: '100%',
            }}>
              <Text style={{
                color: '#000000',
                fontSize: 14,
                fontWeight: '500',
              }}>{title}</Text>
              <Text style={{
                color: '#00000080',
                fontSize: 14,
                fontWeight: '400',
              }}>
                {
                  (quota > 0)
                  ? `質押數量:${quota}`
                  : '尚未質押'
                }
              </Text>
              {
                apr
                ? <Text style={{
                    color: '#00000080',
                    fontSize: 14,
                    fontWeight: '400',
                  }}>APR:{apr}%</Text>
                : <></>
              }
            </View>
          </TouchableOpacity>
}
const Key = ({text}:{text: string}) => (
  <Text style={{
    color: '#00000080',
    fontSize: 16,
    fontWeight: '400'
  }}>{text}</Text>
)
const Value = ({text}:{text: string}) => (
  <Text style={{
    color: '#00000080',
    fontSize: 16,
    fontWeight: '400'
  }}>{text}</Text>
)
const Pair = ({children}:{children: ReactNode}) => (
  <View style={{
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  }}>
    {children}
  </View>
)
const Foot = ({text}:{text: string}) => (
  <Text style={{
    width: '100%',
    color: '#000000',
    fontSize: 14,
    fontWeight: '400',
  }}>{text}</Text>
)
const Check = ({checked, onPress}:{
                checked: boolean,
                onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
              }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
    //backgroundColor: '#264C98',
      width: 67,
      height: 21,
    //flexDirection: 'row',
    //justifyContent: (checked? 'flex-end': 'flex-start'),
    //paddingHorizontal: 10,
    //borderRadius: 5,
    }}
  >
    {
      checked
      ? <ON  name='on'  width={67} height={21}/>
      : <OFF name='off' width={67} height={21}/>
    }
    {/*
    <View style={{
      width: 20,
      height: 20,
      backgroundColor: '#FFFFFF',
      borderWidth: 0.2, 
      borderStyle: 'solid', 
      borderColor: '#264C98',
      borderRadius: 100,
    }}/>
    */}
  </TouchableOpacity>
)
/**
 * Main view for the wallet
 */
const MyPersona = ({
  navigation,
  storePrivacyPolicyShownDate,
  shouldShowNewPrivacyToast,
  storePrivacyPolicyClickedOrClosed,
}: WalletProps) => {
  const { navigate } = useNavigation();
  const route = useRoute();
  const walletRef = useRef(null);
  const theme = useTheme();
  const { toastRef } = useContext(ToastContext);
  const { trackEvent, createEventBuilder } = useMetrics();
  const styles = createStyles(theme);
  const { colors } = theme;
  const [check, setCheck] = useState(false)
  const { day, stake } = route.params as {day: number, stake: Stake}
  const [reward, setReward] = useState<number>(stake.reward? stake.reward: 0)
  const [balance, setBalance] = useState<number>(stake.amount)
  const networkConfigurations = useSelector(selectNetworkConfigurations);
  const evmNetworkConfigurations = useSelector(
    selectEvmNetworkConfigurationsByChainId,
  );

  const selectedInternalAccount = useSelector(selectSelectedInternalAccount);
  /**
   * An array that represents the user tokens by chainId and address
   */
  const tokensByChainIdAndAddress = useSelector(selectTransformedTokens);
  /**
   * Current provider ticker
   */
  const ticker = useSelector(selectEvmTicker);
  /**
   * Current onboarding wizard step
   */
  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wizardStep = useSelector((state: any) => state.wizard.step);
  const chainId = useSelector(selectChainId);

  const isDataCollectionForMarketingEnabled = useSelector(
    (state: RootState) => state.security.dataCollectionForMarketing,
  );
  /**
   * Is basic functionality enabled
   */
  const basicFunctionalityEnabled = useSelector(
    (state: RootState) => state.settings.basicFunctionalityEnabled,
  );

  const { isEnabled: getParticipationInMetaMetrics } = useMetrics();

  const isParticipatingInMetaMetrics = getParticipationInMetaMetrics();

  const currentToast = toastRef?.current;

  const accountName = useAccountName();

  const accountAvatarType = useSelector((state: RootState) =>
    state.settings.useBlockieIcon
      ? AvatarAccountType.Blockies
      : AvatarAccountType.JazzIcon,
  );
  const isFocused = useIsFocused();
  /*
  const QueryCode = async () => {
    const token   = await StorageWrapper.getItem('accessToken');
    await wzInfo(token)
  }
    */
  
  async function QueryStake(sid: string) {
    const token   = await StorageWrapper.getItem('accessToken');
    const data    = await wzListStake(token)
    console.log('WeSecord QueryCode', data.ok, data.rx)
    if (data.ok) {
    //setStakes(data.rx)
      const list: Stake[] = data.rx
      const found = list.find((value)=>(value.sid == sid))
      if (found) {
        setBalance(found.amount)
        setReward(found.reward? found.reward: 0)
      }
    } else {
      console.log('wzListStake failed', data)
    }
  }
  useEffect(() => {
    if (isFocused) { QueryStake(stake.sid) }
  }, [isFocused]);
  
  useEffect(() => {
    if (
      isDataCollectionForMarketingEnabled === null &&
      isParticipatingInMetaMetrics &&
      isPastPrivacyPolicyDate
    ) {
      navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
        screen: Routes.SHEET.EXPERIENCE_ENHANCER,
      });
    }
  }, [
    isDataCollectionForMarketingEnabled,
    isParticipatingInMetaMetrics,
    navigate,
  ]);

  useEffect(() => {
    if (!shouldShowNewPrivacyToast) return;

    storePrivacyPolicyShownDate();
    currentToast?.showToast({
      variant: ToastVariants.Plain,
      labelOptions: [
        {
          label: strings(`privacy_policy.toast_message`),
          isBold: false,
        },
      ],
      closeButtonOptions: {
        label: strings(`privacy_policy.toast_action_button`),
        variant: ButtonVariants.Primary,
        onPress: () => {
          storePrivacyPolicyClickedOrClosed();
          currentToast?.closeToast();
        },
      },
      linkButtonOptions: {
        label: strings(`privacy_policy.toast_read_more`),
        onPress: () => {
          storePrivacyPolicyClickedOrClosed();
          currentToast?.closeToast();
          Linking.openURL(CONSENSYS_PRIVACY_POLICY);
        },
      },
      hasNoTimeout: true,
    });
  }, [
    storePrivacyPolicyShownDate,
    shouldShowNewPrivacyToast,
    storePrivacyPolicyClickedOrClosed,
    currentToast,
  ]);

  const isNotificationEnabled = useSelector(
    selectIsMetamaskNotificationsEnabled,
  );

  const isProfileSyncingEnabled = useSelector(selectIsProfileSyncingEnabled);

  const unreadNotificationCount = useSelector(
    getMetamaskNotificationsUnreadCount,
  );

  const readNotificationCount = useSelector(getMetamaskNotificationsReadCount);
  const name = useSelector(selectNetworkName);
  
  const networkName = networkConfigurations?.[chainId]?.name ?? name;

  const networkImageSource = useSelector(selectNetworkImageSource);
  
  const nativeEvmAsset = useSelector(selectNativeEvmAsset);
  const stakedEvmAsset = useSelector(selectStakedEvmAsset);

  /**
   * Shows Nft auto detect modal if the user is on mainnet, never saw the modal and have nft detection off
   */
  useCheckNftAutoDetectionModal();

  /**
   * Show multi rpc modal if there are networks duplicated and if never showed before
   */
  useCheckMultiRpcModal();

  /**
   * Callback to trigger when pressing the navigation title.
   */
  const onTitlePress = useCallback(() => {
    navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.NETWORK_SELECTOR,
    });
    trackEvent(
      createEventBuilder(MetaMetricsEvents.NETWORK_SELECTOR_PRESSED)
        .addProperties({
          chain_id: getDecimalChainId(chainId),
        })
        .build(),
    );
  }, [navigate, chainId, trackEvent, createEventBuilder]);

  /**
   * Check to see if notifications are enabled
   */
  useEffect(() => {
    async function checkIfNotificationsAreEnabled() {
      await NotificationsService.isDeviceNotificationEnabled();
    }
    checkIfNotificationsAreEnabled();
  });

  useEffect(
    () => {
      requestAnimationFrame(async () => {
        const { AccountTrackerController } = Engine.context;

        Object.values(evmNetworkConfigurations).forEach(
          ({ defaultRpcEndpointIndex, rpcEndpoints }) => {
            AccountTrackerController.refresh(
              rpcEndpoints[defaultRpcEndpointIndex].networkClientId,
            );
          },
        );
      });
    },
    /* eslint-disable-next-line */
    // TODO: The need of usage of this chainId as a dependency is not clear, we shouldn't need to refresh the native balances when the chainId changes. Since the pooling is always working in the back. Check with assets team.
    // TODO: [SOLANA] Check if this logic supports non evm networks before shipping Solana
    [navigation, chainId, evmNetworkConfigurations],
  );

  useEffect(() => {
    if (!selectedInternalAccount) return;
    navigation.setOptions(
      getPersonaNavbar(navigation, route, colors, 'WeZan理財')
    );
  }, [
    selectedInternalAccount,
    accountName,
    accountAvatarType,
    navigation,
    colors,
    networkName,
    networkImageSource,
    onTitlePress,
    isNotificationEnabled,
    isProfileSyncingEnabled,
    unreadNotificationCount,
    readNotificationCount,
  ]);

  const turnOnBasicFunctionality = useCallback(() => {
    navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.BASIC_FUNCTIONALITY,
    });
  }, [navigation]);

  const onPressRemburse = () => {
    const action  = ()=>navigation.navigate('WeFinance')
    const title   = '積分贖回'
    const button  = '返回理財首頁'
    const callback = (value: {value: number}) => {
      const message = `贖回成功！${value} 積分將返還至您的 wPoint 帳戶。 系統會自動審核並於當日內入帳。請留意錢包變化或通知中心提示`
      navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
        screen: Routes.MODAL.WE_DONBOX,
        params: { title, message, button, action }
      });
    }
    navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.MODAL.WE_REMBURSE,
      params: { day, stake, callback }
    });
  };

  const onPressConfirm = async () => {
  //const token   = await StorageWrapper.getItem('accessToken');
  //await wzAddStake(token, 0, stake)
  }

  const renderContent = useCallback(() => {
    const route = useRoute();
    const { day, stake } = route.params as {day: number, stake: Stake}
    const assets = tokensByChainIdAndAddress
      ? [...tokensByChainIdAndAddress]
      : [];
    if (nativeEvmAsset) {
      assets.push(nativeEvmAsset);
    }
    if (stakedEvmAsset) {
      assets.push(stakedEvmAsset);
    }
    const icon  = (day > 0)
                  ? (day == 30)
                    ? <P30 name='P30' width={50} height={50}/>
                    : <P60 name='P60' width={50} height={50}/>
                  : <P00 name='P00' width={50} height={50}/>
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          padding: 20,
          ...styles.wrapper
        }}
        testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
      >
        <View style={{
          width: '100%',
          marginBottom: 10
        }}>
          <Option
            icon={icon} 
            title={ (day>0)? `${day} 天質押`: '活期質押'} 
            quota={balance}
            apr={3.42}
          />
        </View>

        <View
            style={{
              width: '100%',
              backgroundColor: '#F6F7FB',
              borderRadius: 10,
              borderStyle: 'solid',
              borderColor: '#FFFFFF',
              borderWidth: 1,
              padding: 5,
              marginBottom: 10,
            }}
        >
          <Pair>
            <Key text='質押數量'/>
            <Value text={`${balance}`}/>
          </Pair>
          <Pair>
            <Key text='APR'/>
            <Value text='3.42%'/>
          </Pair>
          <Pair>
            <View/>
            { (day > 0) ? <Value text='到期贖回日期:2025/7/30'/>: <View/> }
          </Pair>
          <View style={{
            width: '100%',
            height: 1,
            backgroundColor: 'gray'
          }}/>
          <Pair>
            <Key text='累計總獎勵'/>
            <Value text={`${reward}`}/>
          </Pair>
        </View>

        <View
            style={{
              width: '100%',
              backgroundColor: '#F6F7FB',
              borderRadius: 10,
              borderStyle: 'solid',
              borderColor: '#FFFFFF',
              borderWidth: 1,
              padding: 5,
              marginBottom: 10,
            }}
        >
          <Pair>
            <Key text={day > 0? '結束質押後自動贖回' :'自動申購'}/>
            <Check checked={check} onPress={()=>setCheck(!check)}/>
          </Pair>
          <View style={{
            width: '100%',
            padding: 10,
          }}>
            <Foot text={
              day > 0
              ? '本產品為30日定期質押，鎖倉期間不可贖回到期後自動返還本金與利息（若開啟自動贖回）'
              : '錢包中的可用餘額用於每日16:00UTC自動申購活期產品，T+1 開始計息，日發利息'
            }/>
          </View>
        </View>
        <View style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 30,
        }}>
          <View style={{width: '45%'}}>
            <TouchableOpacity onPress={onPressRemburse}>
              <BackStep caption={(day > 0)? '返回理財': '贖回'}/>
            </TouchableOpacity>
          </View>
          <View style={{width: '45%'}}>
            <TouchableOpacity>
              <NextStep caption={(day > 0)? '再申購': '申購'}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    styles,
    colors,
    basicFunctionalityEnabled,
    turnOnBasicFunctionality,
    navigation,
    ticker,
    tokensByChainIdAndAddress,
  ]);
  const renderLoader = useCallback(
    () => (
      <View style={styles.loader}>
        <ActivityIndicator size="small" />
      </View>
    ),
    [styles],
  );

  /**
   * Return current step of onboarding wizard if not step 5 nor 0
   */
  const renderOnboardingWizard = useCallback(
    () =>
      [1, 2, 3, 4, 5, 6, 7].includes(wizardStep) && (
        <OnboardingWizard
          navigation={navigation}
          coachmarkRef={walletRef.current}
        />
      ),
    [navigation, wizardStep],
  );

  return (
    <ErrorBoundary navigation={navigation} view="MyWallet">
      <View style={baseStyles.flexGrow}>
        {selectedInternalAccount ? renderContent() : renderLoader()}

        {renderOnboardingWizard()}
      </View>
    </ErrorBoundary>
  );
};

// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStateToProps = (state: any) => ({
  shouldShowNewPrivacyToast: shouldShowNewPrivacyToastSelector(state),
  receiveAsset: state.modals.receiveAsset,  // [Arthur] {connect PaymentRequest}
});

// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatchToProps = (dispatch: any) => ({
  storePrivacyPolicyShownDate: () =>
    dispatch(storePrivacyPolicyShownDateAction(Date.now())),
  storePrivacyPolicyClickedOrClosed: () =>
    dispatch(storePrivacyPolicyClickedOrClosedAction()),
  showNftFetchingLoadingIndicator: () =>
    dispatch(showNftFetchingLoadingIndicatorAction()),
  hideNftFetchingLoadingIndicator: () =>
    dispatch(hideNftFetchingLoadingIndicatorAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyPersona);
