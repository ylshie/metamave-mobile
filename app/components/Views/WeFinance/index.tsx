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
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Finance from './images/finance.svg'
import Hand from './images/hand.svg'
import Golden from './images/golden.svg'
import Dollar from './images/dollar.svg'
import { wzInfo } from '../WeSignup/account';
import StorageWrapper from '../../../store/storage-wrapper';
import { MyToast } from '../confirmations/legacy/SendFlow/WeSendOption';
import { Alert, BackHandler } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Recrod from './images/record.svg'
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

const FrameBlue = ({children}:{children: ReactNode}) => {
  return  <LinearGradient
            colors={['#DCECFF','#C9E0FF']}
            style={{
              width: '100%',
              flexDirection: 'row',
              borderRadius: 11,
              padding: 10,
            }}
          >
            {children}
          </LinearGradient>
}
const FrameGray = ({children}:{children: ReactNode}) => {
  return  <LinearGradient
            colors={['#A0AEC0', '#E0EAF7']}
            style={{
              width: '100%',
              borderRadius: 15,
              flexDirection: 'row',
              padding: 10,
            }}
          >
            {children}
          </LinearGradient>
}
const FrameWhite = ({children, onPress}:{
    children: ReactNode,
    onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
  }) => {
  return <TouchableOpacity
  onPress={onPress}
  style={{
    width: '100%',
    backgroundColor: '#F6F7FB',
    borderRadius: 10,
    borderStyle: 'solid',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  }}>
    {children}
  </TouchableOpacity>
}
const ButtonBlue = ({text, onPress}:
                    {text: string, 
                    onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
                  }) => {
  return <TouchableOpacity 
          onPress={onPress}
          style={{
            borderRadius: 10,
            paddingVertical: 0,
            paddingHorizontal: 10,
            backgroundColor: '#2343D6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '400'
          }}>
          {text}
          </Text>
        </TouchableOpacity>
}
const Slot = ({children}:{children: ReactNode}) => {
  const list  = React.Children.toArray(children)
  return <View style={{
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    //paddingHorizontal: 10,
    //borderColor: 'red',
    //borderWidth: 1,
    //borderStyle: 'solid',
  }}>
    {children}
  </View>
}
export const PointStake = ({onPress}:{
  onPress?: (((event: GestureResponderEvent) => void) & (() => void)) | undefined
}) => (
          <FrameGray>
            <View style={{
              width: '72%',
              justifyContent: 'flex-start',
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
              }}>積分存款寶</Text>
              <View style={{
                flexDirection: 'row'
              }}>
                <Text style={{
                  color: '#000000',
                  fontSize: 11,
                  fontWeight: '400',
                //flex: 1,
                }}>質押 wPoints 30 天 → 獲得額外</Text>
                <Text style={{
                  color: '#FF4000',
                  fontSize: 11,
                  fontWeight: '400',
                }}>APY 5%</Text>
              </View>
              <TouchableOpacity
              onPress={onPress}
              style={{
                width: 128,
              }}>
                <ButtonBlue text='立即存入-->' onPress={onPress}/>
              </TouchableOpacity>
            </View>
            <View style={{
              width: '28%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Hand name='hand' width={120} height={90}/>
            </View>
          </FrameGray>
)
const Balance = ({value}:{value:number}) => (
  <Text style={{
    color: '#4A5568',
    fontSize: 21,
    fontWeight: '700',
  }}>{value}</Text>
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
  const [point, setPoint] = useState(0) // 2478
  const [stake, setStake] = useState(0) // 1508
  const [showToast, setShowToast] = useState(false)
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) { QueryCode() }
  }, [isFocused]);

  const onPressNothing = () => {
    console.log("onPressNothing")
    setShowToast(true)
    setTimeout(()=>{
      setShowToast(false)
    }, 2000)
   }

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

  const copyToClipboard = useCopyClipboard();
  
  async function QueryCode() {
    const token   = await StorageWrapper.getItem('accessToken');
    const account = await StorageWrapper.getItem('account');
    const data    = await wzInfo(token, account)
    console.log('WeFinance QueryCode', data)
    setPoint(data.info.point)
  }
  console.log('====NO EFFECT====')
  /*
  useEffect(()=>{
    console.log('====EFFECT====')
    QueryCode()
  }, [])
  */

  /*
  useEffect(() => {
    const backAction = () => {
      console.log('===BACK ACTION====')
      
      QueryCode()
      return false; //true; // Prevents default back button behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Clean up the listener on unmount
  }, []);
  */
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

  const onPressPoint = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('WePoint');
  };

  const onPressStake = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('WeStake');
  };

  const onPressStake30 = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('WeStake30', { day: 30 });
  };
  
  const onPressSecord = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('WeSecord');
  };

  const renderContent = useCallback(() => {
    const assets = tokensByChainIdAndAddress
      ? [...tokensByChainIdAndAddress]
      : [];
    if (nativeEvmAsset) {
      assets.push(nativeEvmAsset);
    }
    if (stakedEvmAsset) {
      assets.push(stakedEvmAsset);
    }
    return (
      <ScrollView>
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 5,
          ...styles.wrapper
        }}
        testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
      >
        <View style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <Text style={{
            color: '#000000',
            textAlign: 'left',
          //fontSize: 15,
          //fontWeight: '500',
            fontSize: 20,
            fontWeight: '600',
          }}>理財選擇</Text>
          <TouchableOpacity onPress={onPressSecord}>
            <Recrod name='record' width={25} height={25}/>
          </TouchableOpacity>
        </View>

        <View style={{
          width: '100%',
          marginBottom: 5,
        }}>
          <FrameBlue>
            <View style={{
              width: '55%',
            }}>
              <Text style={{
                color: '#182F77',
                fontSize: 14,
                fontWeight: '400'
              }}>總理財金額</Text>
              <Text style={{
                color: '#182F77',
                fontSize: 30,
                fontWeight: '800',
                lineHeight: 32,
              }}>3,578</Text>
              <Text style={{
                color: '#4A5568',
                fontSize: 14,
                fontWeight: '400',
              }}>總理財收益: 0 wPoints</Text>
            </View>
            <View style={{
              width: '40%',
            }}>
              <Finance name='finance' width={120} height={120}/>
            </View>
          </FrameBlue>
        </View>
        <View style={{
          width: '100%',
          marginBottom: 5,
        }}>
          <FrameWhite>
            <Slot>
              <Text style={{
                color: '#4A5568',
                fontSize: 16,
                fontWeight: '600'
              }}>wPoints(積分)</Text>
              <Text style={{
                color: '#000000',
                fontSize: 10,
                fontWeight: '400',
              }}>投資(wPoints)</Text>
            </Slot>
            <Slot>
              <ButtonBlue text='兌換' onPress={onPressPoint}/>
              <Balance value={point}/>
            </Slot>
          </FrameWhite>
        </View>

        <View style={{
          width: '100%',
          marginBottom: 5,
        }}>
          <FrameWhite>
            <Slot>
              <Text style={{
                color: '#4A5568',
                fontSize: 16,
                fontWeight: '600'
              }}>理財</Text>
              <Text style={{
                color: '#000000',
                fontSize: 10,
                fontWeight: '400',
              }}>投資(wPoints)</Text>
            </Slot>
            <Slot>
              <ButtonBlue text='去質押' onPress={onPressStake}/>
              <Balance value={stake}/>
            </Slot>
          </FrameWhite>
        </View>

        <Text style={{
          width: '100%',
          color: '#4A5568',
          fontSize: 20,
          fontWeight: '600',
          textAlign: 'left',
        }}>理財服務</Text>

        <View style={{
          width: '100%',
          marginTop: 5,
          marginBottom: 10,
        }}>
          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <View
              style={{width:'48%'}}
            >
              <FrameWhite onPress={onPressNothing}>
                <Golden name='golden' width={50} height={50}/>
                <Text style={{
                  color: '#2343D6',
                  fontSize: 17,
                  fontWeight: '700',
                }}>5.32% +3%</Text>
                <Text style={{
                  color: '#000000',
                  fontSize: 14,
                  fontWeight: '400',
                }}>流動性挖礦</Text>
              </FrameWhite>
            </View>
            <View
              style={{width:'48%'}}
            >
              <FrameWhite onPress={onPressNothing}>
                <Dollar name='dollar' width={50} height={50}/>
                <Text style={{
                  color: '#2343D6',
                  fontSize: 17,
                  fontWeight: '700',
                }}>APR 4.38%</Text>
                <Text style={{
                  color: '#000000',
                  fontSize: 14,
                  fontWeight: '400',
                }}>儲蓄賺幣</Text>
              </FrameWhite>
            </View>
          </View>
        </View>
        <PointStake onPress={onPressStake30}/>
        {
          showToast
          ? <MyToast text={'近期開放'}/>
          : <></>
        }
      </View>
      </ScrollView>
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
