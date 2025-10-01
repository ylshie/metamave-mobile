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
  TextInput,
  ImageSourcePropType,
  ScrollView,
  DimensionValue,
  TouchableOpacity,
} from 'react-native';

import { connect, useSelector } from 'react-redux';
//import { baseStyles } from '../../../styles/common';
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
//import Banner from './images/banner.svg'
//import Google from './images/google.svg'
//import Apple from './images/apple.svg'
//import Twitter from './images/twitter.svg'
//import Telegram from './images/telegram.svg'
//import Explore from './images/explore.svg'
import LinearGradient from 'react-native-linear-gradient';
//import Copy from './images/copy.svg'
//import Box from './images/box.svg'
import Banner from './images/banner.svg'
//import Badges from './images/allbadges.svg'
//import Brone from './images/brone.svg'
//import Silver from './images/silver.svg'
//import Gold from './images/gold.svg'
//import BadgeN from './images/badge_n.svg'
//import BadgeA from './images/badge_a.svg'
//import BadgeG from './images/badge_g.svg'
//import Setting from './images/setting.svg'
//import { Level } from './level';
//import { Task } from './task';
//import { Step } from './step';
import StorageWrapper from '../../../store/storage-wrapper';
import { wzInfo } from '../WeSignup/account';
import useCopyClipboard from '../Notifications/Details/hooks/useCopyClipboard';
import { MyToast } from '../confirmations/legacy/SendFlow/WeSendOption';
import { drawMe } from './wzSDK';
import Barcode from '../../../images/banners/barcode.svg';
import Download from '../../../images/banners/download.svg';
import WLink from '../../../images/banners/link.svg';
import barcode from '../../../images/banners/barcode.png';
import download from '../../../images/banners/download.png';
import wlink from '../../../images/banners/link.png';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Close from './images/close.svg'
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

const debugStyle = {
  borderColor: 'green',
  borderStyle: 'solid',
  borderWidth: 1,
}
/**
 * Main view for the wallet
 */
const MyFriend = ({
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
  const [code, setCode] = useState<string>('5D7EW')
  const [showToast, setShowToast] = useState(false)
  const [url,  setUrl]  = useState<string>()
  const [icode, setICode] = useState<string>()
  const [ilink, setILink] = useState<string>()

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

  async function QueryCode() {
    const token   = await StorageWrapper.getItem('accessToken');
    const account = await StorageWrapper.getItem('account');
    const data    = await wzInfo(token, account)
  //console.log('QueryCode', data)
    setCode(data.info.share)
  }
  useEffect(()=>{
    QueryCode()
  })
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

  const checkDataURL = async () => {
    console.log('checkDataURL', 'enter')
    const {data, code, link} = route.params as {data: any, code: any, link: any};
    console.log('checkDataURL', 'code', code)
  //console.log('checkDataURL', 'data', data)
    setICode(code)
    setILink(link)
    const ret = await data
    console.log('checkDataURL', 'url', url)
  //setUrl('data:image/png;base64,' + ret.image)
    setUrl(ret.image)
  }
  useEffect(() => {
    if (url) return;
    checkDataURL()
  }, [])

  useEffect(() => {
  //if (!selectedInternalAccount) return;
    console.log("========= 邀請好友 ==========")
    navigation.setOptions(
      getPersonaNavbar(navigation, route, colors, '邀請好友')
    );
  }, [
  //selectedInternalAccount,
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

  const win = Dimensions.get('window');
  /*
  const doGetCard = async (code: string)=> {
    try {
      console.log('doGetCard', 'call', code)
      const data = await drawMe(code)
      console.log('doGetCard', 'done', data)
    //=======[ Important ]================================================
    // data url can't not have space between 'type.' and base64 data
    // Otherwise it will cause image unable to show at react native iOS 
    //====================================================================
      setUrl('data:image/png;base64,' + data.image)
    } catch(error) {
      console.log('doGetCard', 'error', error)
    }
  }
  */
  const shareFile = (dataUrl: string|undefined) => {
    if (! dataUrl) return
    const filePath = RNFS.DocumentDirectoryPath + '/card.png';
    RNFS.writeFile(filePath, dataUrl, 'base64').then(async () => {
      console.log('File written successfully!', filePath)
      try {
        const tag = 'file://'+ filePath
        console.log('cameral roll tag=', tag)
        const res = await Share.open({url: tag});
        console.log('share file done', res)
        RNFS.unlink(filePath);
      } catch(err) {
        console.log('share file error', err)
      }
    })
    .catch((err) => {
      console.error(err.message)
    });
  }
  const copyToClipboard = useCopyClipboard();
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
      <View
        style={{
          alignItems: 'center',
          ...styles.wrapper
        }}
        testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1F4490', //'#E4EDFF',
          //alignItems: 'center',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 60,
            borderWidth: 1,
          //borderColor: 'red',
            borderStyle: 'solid',
          //paddingBottom: 60,
          //...styles.wrapper
          }}
          //testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
        >
            <View style={{
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            //padding: 10,
            }}>
              <TouchableOpacity
                onPress={()=>{navigation.goBack()}}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'flex-end',
                  paddingRight: 26,
                  paddingBottom: 5,
                  //borderColor: 'red',
                  //borderWidth: 1,
                  //borderStyle: 'solid',
                }}
              >
                <Close name='close' width={30} height={30}/>
              </TouchableOpacity>
              {
                url
                ? <View style={{
                //borderWidth: 1,
                //borderColor: 'green',
                //borderStyle: 'solid',
                  marginBottom: 20,

                }}>
                    <Image style={{
                              marginLeft: 2, 
                              height: 450, 
                              width: 340,
                          }} 
                          source={{uri: 'data:image/png;base64,'+url}}
                    />
                  </View>
                : <></>
              }
              <View style={{
                width: 300,
                backgroundColor: '#FFFFFF',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                borderWidth: 1,
              //borderColor: 'blue',
                borderStyle: 'solid',
                borderRadius: 8,
              }}>
                <TouchableOpacity
                  onPress={()=> shareFile(url)} 
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {/*<Download name='download' width={40} height={40}/>*/}
                  <Image width={40} height={40} source={download}/>
                  <Text>保存海報</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={()=>ilink? copyToClipboard(ilink): {}} 
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/*<WLink name='wlink' width={40} height={40}/>*/}
                  <Image width={40} height={40} source={wlink}/>
                  <Text>複製連結</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={()=>icode? copyToClipboard(icode): {}} 
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/*<Barcode name='barcode' width={40} height={40}/>*/}
                  <Image width={40} height={40} source={barcode}/>
                  <Text>複製邀請碼</Text>
                </TouchableOpacity>
              </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyFriend);
