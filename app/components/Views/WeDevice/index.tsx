/* eslint-disable @typescript-eslint/no-require-imports */
import React, {
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  ActivityIndicator,
  View,
  Linking,
  TextInput,
  ImageSourcePropType,
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
import LinearGradient from 'react-native-linear-gradient';
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
      getPersonaNavbar(navigation, route, colors, '登入裝置')
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

  const win = Dimensions.get('window');
  const onPressGeneral = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('SecurityPersona');
  };
  
  const RenderItem = ({caption}: {caption: string}) => (
              <View style={{
                width: '100%',
                flexDirection: 'row',
              //borderStyle: 'solid',
              //borderColor: 'black',
              //borderWidth: 1,
                marginTop: 10,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                }}>{caption}</Text>
              </View>
  )
  const Info = ({caption, info}: {caption: string, info: string}) => (
    <Text style={{
      color: '#686868',
      fontSize: 10,
      fontWeight: '500',
    }}>
      {caption} {info}
    </Text>
  )
  const Device = ({name, current}: {name: string, current: boolean}) => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    }}>
      <Text style={{
        color: '#000000',
        fontSize: 10,
        fontWeight: '500',
      }}>{name}</Text>
      {
        current
        ? <View style={{
            backgroundColor: 'rgba(126, 142, 152, 0.3)',
          }}>
            <Text style={{
              color: '#32303D',
              fontSize: 10,
              fontWeight: '500',
            }}>目前裝置</Text>
          </View>
        : <></>
      }
    </View>
  )

  interface TagBaseProps {
    children: React.ReactNode | string;
  }
  const Item = ({children}: {children: React.ReactNode}) => (
    <View style={{
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#F6F7FB',
      borderWidth: 1.5,
      borderStyle: 'solid',
      borderColor: '#FFFFFF',
    //box-shadow: 0px -1px 4px #F8F9FB, 0px 5px 4px #DBDEE3;
      borderRadius: 10,
      marginTop: 10,
    }}>
      {children}
    </View>
  )
  const SubItem = ({children}: {children: React.ReactNode}) => (
    <View style={{
      left: '5%',
      width: '70%',
      justifyContent: 'flex-start',
    }}>
      {children}
    </View>
  )
  const Back = () => (
    <LinearGradient 
                colors={['#B2BACD', '#6F7789']} 
                style={{
                  borderRadius: 3,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: '500',
              }}>退出</Text>
            </LinearGradient>
  )
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
        {!basicFunctionalityEnabled ? (
          <View style={styles.banner}>
            <BannerAlert
              severity={BannerAlertSeverity.Error}
              title={strings('wallet.banner.title')}
              description={
                <Text color={TextColor.Info} onPress={turnOnBasicFunctionality}>
                  {strings('wallet.banner.link')}
                </Text>
              }
            />
          </View>
        ) : null}
        <>
          <Item>
            <SubItem>
              <Device name='VIVO(Android)' current={true}/>
              <Info caption='登入時間' info='2025-04-20 22:05:01'/>
              <Info caption='登入地點' info='台灣-台北'/>
              <Info caption='登入IP' info='49.221.22.22'/>
            </SubItem>
            <Back />
          </Item>
          <Item>
            <SubItem>
              <Device name='桌上型裝置' current={false}/>
              <Info caption='登入時間' info='2025-03-20 02:14:51'/>
              <Info caption='登入地點' info='台灣-台中'/>
              <Info caption='登入IP'  info='49.111.52.52'/>
            </SubItem>
            <Back />
          </Item>
          <Text style={{
            width: '90%',
            color: '#454545',
            fontSize: 10,
            fontWeight: '500',
            textAlign: 'center',
          }}>
          平台會嚴格對個人資訊進行加密保護，以保證使用者的隱私及安全。
          若遇到異常登入請立即登出並聯繫平台。
          </Text>
        </>
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
