/* eslint-disable @typescript-eslint/no-require-imports */
import React, {
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
  FC
} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TextStyle,
  Linking,
  ImageSourcePropType,
  Alert,
} from 'react-native';
import type { Theme } from '@metamask/design-tokens';
import { connect, useSelector } from 'react-redux';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { baseStyles } from '../../../styles/common';
import Tokens from '../../UI/Tokens';
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
import CollectibleContracts from '../../UI/CollectibleContracts';
import { MetaMetricsEvents } from '../../../core/Analytics';
import OnboardingWizard from '../../UI/OnboardingWizard';
import ErrorBoundary from '../ErrorBoundary';
import { useTheme } from '../../../util/theme';
import Routes from '../../../constants/navigation/Routes';
import {
  getDecimalChainId,
  getIsNetworkOnboarded,
  isPortfolioViewEnabled,
} from '../../../util/networks';
import {
  selectChainId,
  selectEvmNetworkConfigurationsByChainId,
  selectIsAllNetworks,
  selectIsPopularNetwork,
  selectNetworkClientId,
  selectNetworkConfigurations,
  selectProviderConfig,
  selectEvmTicker,
} from '../../../selectors/networkController';
import {
  selectNetworkName,
  selectNetworkImageSource,
} from '../../../selectors/networkInfos';
import {
  selectAllDetectedTokensFlat,
  selectDetectedTokens,
  selectTokens,
  selectTransformedTokens,
} from '../../../selectors/tokensController';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  selectConversionRate,
  selectCurrentCurrency,
} from '../../../selectors/currencyRateController';
import BannerAlert from '../../../component-library/components/Banners/Banner/variants/BannerAlert/BannerAlert';
import { BannerAlertSeverity } from '../../../component-library/components/Banners/Banner';
import Text, {
  TextColor,
  getFontFamily,
  TextVariant,
} from '../../../component-library/components/Texts/Text';
import { useMetrics } from '../../hooks/useMetrics';
import { RootState } from '../../../reducers';
import usePrevious from '../../hooks/usePrevious';
import { selectSelectedInternalAccount } from '../../../selectors/accountsController';
import { selectAccountBalanceByChainId } from '../../../selectors/accountTrackerController';
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

import { PortfolioBalance } from '../../UI/Tokens/TokenList/WePortfolioBalance';
import useCheckNftAutoDetectionModal from '../../hooks/useCheckNftAutoDetectionModal';
import useCheckMultiRpcModal from '../../hooks/useCheckMultiRpcModal';
import { selectContractBalances } from '../../../selectors/tokenBalancesController';
import {
  selectTokenNetworkFilter,
  selectUseTokenDetection,
} from '../../../selectors/preferencesController';
import { TokenI } from '../../UI/Tokens/types';
import { Hex } from '@metamask/utils';
import { Token } from '@metamask/assets-controllers';
import { Carousel } from '../../UI/Carousel';
import { selectIsEvmNetworkSelected } from '../../../selectors/multichainNetworkController';
///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
import SolanaNewFeatureContent from '../../UI/SolanaNewFeatureContent/SolanaNewFeatureContent';
///: END:ONLY_INCLUDE_IF
import {
  selectNativeEvmAsset,
  selectStakedEvmAsset,
} from '../../../selectors/multichain';
import { useNftDetectionChainIds } from '../../hooks/useNftDetectionChainIds';
import Logger from '../../../util/Logger';
/*----- [Arthur] -----*/
import styleSheet from '../WalletActions/WalletActions.styles';
import { useStyles } from '../../../component-library/hooks';
import { selectCanSignTransactions } from '../../../selectors/accountsController';
import { isEvmAccountType, SolScope } from '@metamask/keyring-api';
import { isMultichainWalletSnap } from '../../../core/SnapKeyring/utils/snaps';
import { CaipChainId, SnapId } from '@metamask/snaps-sdk';
import { sendMultichainTransaction } from '../../../core/SnapKeyring/utils/sendMultichainTransaction';
import BottomSheet, {
  BottomSheetRef,
} from '../../../component-library/components/BottomSheets/BottomSheet';
import { swapsUtils } from '@metamask/swaps-controller';
import { swapsLivenessSelector } from '../../../reducers/swaps';
/*--------------------*/
import { Image } from 'react-native';
import { SvgProps } from 'react-native-svg';
//import usda from './usda.svg'
//import xgame from './xgame.svg'
import { Dimensions } from 'react-native';
/*--------------------*/
import iSecurity from './images/security.png';
import iLaguage  from './images/language.png'
import iCurrency from './images/currency.png'
import iHelp     from './images/help.png'
import iPhone   from './images/phone.png'
import Banner from './images/banner.svg';
import { RenderItem } from '../WePersona';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';

//const webClientId = '521969317751-fjlej86p74kr1jnvt3qn8j8tn4cdcbp6.apps.googleusercontent.com'
//const webClientId = '521969317751-53q38a335vgosgj4nsup7p1s149nho8p.apps.googleusercontent.com'
//const idWho1  = '521969317751-53q38a335vgosgj4nsup7p1s149nho8p.apps.googleusercontent.com'
//const idWho2 = '521969317751-fjlej86p74kr1jnvt3qn8j8tn4cdcbp6.apps.googleusercontent.com'
const idProd  = '521969317751-frn0aovmv2qposmilrfpil3s017u7595.apps.googleusercontent.com'
const idDebug = '521969317751-5dbab0ujkgs902681lo0bnaek8u56rtm.apps.googleusercontent.com'

const webClientId = idDebug
const configureGoogleSignIn = () => {
  console.log('client id=', webClientId)
  GoogleSignin.configure({
    webClientId,
    iosClientId: '',
    offlineAccess: false,
    profileImageSize: 150,
  });
};
const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const { type, data } = await GoogleSignin.signIn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (type === 'success') {
      console.log('\n=============================\n',{ data }, '\n======================\n')
      //this.setState({ userInfo: data, error: undefined });
      Alert.alert('ok: name='+data.user.name+' email='+data.user.email+' id='+data.user.id);
    } else {
      // sign in was cancelled by user
      setTimeout(() => {
        Alert.alert('cancelled: id='+webClientId);
      }, 500);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Alert.alert('exception:' + error.message+' id='+webClientId);
    console.log('signin error', error)
    /*
    if (isErrorWithCode(error)) {
      console.log('Arthur', 'error', error.message, error);
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          //Alert.alert(
          //  'in progress',
          //  'operation (eg. sign in) already in progress',
          //);
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          //Alert.alert('play services not available or outdated');
          break;
        default:
          //Alert.alert('Something went wrong: ', error.toString());
      }
      //this.setState({ error });
    } else {
      alert(`an error that's not related to google sign in occurred`);
    }
    */
  }
};

const createStyles = ({ colors, typography }: Theme) =>
  StyleSheet.create({
    base: {
      paddingHorizontal: 16,
    },
    wrapper: {
      flex: 1,
    //backgroundColor: colors.background.default,
      backgroundColor: '#ECF2F8', // [Arthur]
    //borderColor: 'green',
    //borderStyle: 'solid',
    //borderWidth: 3,
    },
    walletAccount: { marginTop: 28 },
    tabUnderlineStyle: {
      height: 2,
      backgroundColor: colors.primary.default,
    },
    tabStyle: {
      paddingBottom: 8,
      paddingVertical: 8,
    },
    tabBar: {
      borderColor: colors.background.default,
      marginBottom: 8,
    },
    textStyle: {
      ...(typography.sBodyMD as TextStyle),
      fontFamily: getFontFamily(TextVariant.BodyMD),
      fontWeight: '500',
    },
    loader: {
      backgroundColor: colors.background.default,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    banner: {
      widht: '80%',
      marginTop: 20,
      paddingHorizontal: 16,
      borderColor: 'red',
      borderStyle: 'solid',
      borderWidth: 3,
    },
    carouselContainer: {
      marginTop: 12,
    },
  });

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
  showNftFetchingLoadingIndicator,
  hideNftFetchingLoadingIndicator,
}: WalletProps) => {
  const { navigate } = useNavigation();
  const route = useRoute();
  const walletRef = useRef(null);
  const theme = useTheme();
  const { toastRef } = useContext(ToastContext);
  const { trackEvent, createEventBuilder } = useMetrics();
  const styles = createStyles(theme);
  const styleActions = useStyles(styleSheet, {});
  const { colors } = theme;

  const networkConfigurations = useSelector(selectNetworkConfigurations);
  const evmNetworkConfigurations = useSelector(
    selectEvmNetworkConfigurationsByChainId,
  );

  /**
   * Object containing the balance of the current selected account
   */
  const accountBalanceByChainId = useSelector(selectAccountBalanceByChainId);

  /**
   * ETH to current currency conversion rate
   */
  const conversionRate = useSelector(selectConversionRate);
  const contractBalances = useSelector(selectContractBalances);
  /**
   * Currency code of the currently-active currency
   */
  const currentCurrency = useSelector(selectCurrentCurrency);
  /**
   * A string that represents the selected address
   */
  const selectedInternalAccount = useSelector(selectSelectedInternalAccount);
  /**
   * An array that represents the user tokens
   */
  const tokens = useSelector(selectTokens);
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
  /**
   * Provider configuration for the current selected network
   */
  const providerConfig = useSelector(selectProviderConfig);
  const chainId = useSelector(selectChainId);

  const prevChainId = usePrevious(chainId);

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

  /**
   * Network onboarding state
   */
  const networkOnboardingState = useSelector(
    (state: RootState) => state.networkOnboarded.networkOnboardedState,
  );

  const isNotificationEnabled = useSelector(
    selectIsMetamaskNotificationsEnabled,
  );

  const isProfileSyncingEnabled = useSelector(selectIsProfileSyncingEnabled);

  const unreadNotificationCount = useSelector(
    getMetamaskNotificationsUnreadCount,
  );

  const readNotificationCount = useSelector(getMetamaskNotificationsReadCount);
  const name = useSelector(selectNetworkName);
  const isEvmSelected = useSelector(selectIsEvmNetworkSelected);

  const networkName = networkConfigurations?.[chainId]?.name ?? name;

  const networkImageSource = useSelector(selectNetworkImageSource);
  const tokenNetworkFilter = useSelector(selectTokenNetworkFilter);

  const isAllNetworks = useSelector(selectIsAllNetworks);
  const isTokenDetectionEnabled = useSelector(selectUseTokenDetection);
  const isPopularNetworks = useSelector(selectIsPopularNetwork);
  const detectedTokens = useSelector(selectDetectedTokens) as TokenI[];
  const nativeEvmAsset = useSelector(selectNativeEvmAsset);
  const stakedEvmAsset = useSelector(selectStakedEvmAsset);

  const allDetectedTokens = useSelector(
    selectAllDetectedTokensFlat,
  ) as TokenI[];
  const currentDetectedTokens =
    isPortfolioViewEnabled() && isAllNetworks && isPopularNetworks
      ? allDetectedTokens
      : detectedTokens;
  const selectedNetworkClientId = useSelector(selectNetworkClientId);

  const chainIdsToDetectNftsFor = useNftDetectionChainIds();
  const swapsIsLive = useSelector(swapsLivenessSelector);

  /**
     * Asset to receive, could be not defined
     */
  let receiveAsset: object;
  let metrics: object;

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
   * Handle network filter called when app is mounted and tokenNetworkFilter is empty
   * TODO: [SOLANA] Check if this logic supports non evm networks before shipping Solana
   */
  const handleNetworkFilter = useCallback(() => {
    // TODO: Come back possibly just add the chain id of the eth
    // network as the default state instead of doing this
    const { PreferencesController } = Engine.context;
    if (Object.keys(tokenNetworkFilter).length === 0) {
      PreferencesController.setTokenNetworkFilter({
        [chainId]: true,
      });
    }
  }, [chainId, tokenNetworkFilter]);

  useEffect(() => {
    handleNetworkFilter();
  }, [chainId, handleNetworkFilter]);

  /**
   * Check to see if notifications are enabled
   */
  useEffect(() => {
    async function checkIfNotificationsAreEnabled() {
      await NotificationsService.isDeviceNotificationEnabled();
    }
    checkIfNotificationsAreEnabled();
  });

  /**
   * Check to see if we need to show What's New modal
   */
  useEffect(() => {
    // TODO: [SOLANA] Revisit this before shipping, we need to check if this logic supports non evm networks
    const networkOnboarded = getIsNetworkOnboarded(
      chainId,
      networkOnboardingState,
    );

    if (wizardStep > 0 || (!networkOnboarded && prevChainId !== chainId)) {
      // Do not check since it will conflict with the onboarding wizard and/or network onboarding
      return;
    }
  }, [
    wizardStep,
    navigation,
    chainId,
    // TODO: Is this providerConfig.rpcUrl needed in this useEffect dependencies?
    providerConfig.rpcUrl,
    networkOnboardingState,
    prevChainId,
    // TODO: Is this accountBalanceByChainId?.balance needed in this useEffect dependencies?
    accountBalanceByChainId?.balance,
  ]);

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
      getPersonaNavbar(navigation, route, colors, '安全')
    );
  }, [
    route,
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

  const getTokenAddedAnalyticsParams = useCallback(
    ({ address, symbol }: { address: string; symbol: string }) => {
      try {
        return {
          token_address: address,
          token_symbol: symbol,
          chain_id: getDecimalChainId(chainId),
          source: 'Add token dropdown',
        };
      } catch (error) {
        Logger.error(
          error as Error,
          'SearchTokenAutocomplete.getTokenAddedAnalyticsParams',
        );
        return undefined;
      }
    },
    [chainId],
  );

  useEffect(() => {
    const importAllDetectedTokens = async () => {
      // If autodetect tokens toggle is OFF, return
      if (!isTokenDetectionEnabled) {
        return;
      }
      const { TokensController } = Engine.context;
      if (
        Array.isArray(currentDetectedTokens) &&
        currentDetectedTokens.length > 0
      ) {
        if (isPortfolioViewEnabled()) {
          // Group tokens by their `chainId` using a plain object
          const tokensByChainId: Record<Hex, Token[]> = {};

          for (const token of currentDetectedTokens) {
            // TODO: [SOLANA] Check if this logic supports non evm networks before shipping Solana
            const tokenChainId: Hex =
              (token as TokenI & { chainId: Hex }).chainId ?? chainId;

            if (!tokensByChainId[tokenChainId]) {
              tokensByChainId[tokenChainId] = [];
            }

            tokensByChainId[tokenChainId].push(token);
          }

          // Process grouped tokens in parallel
          const importPromises = Object.entries(tokensByChainId).map(
            async ([networkId, allTokens]) => {
              const chainConfig = evmNetworkConfigurations[networkId as Hex];
              const { defaultRpcEndpointIndex } = chainConfig;
              const { networkClientId: networkInstanceId } =
                chainConfig.rpcEndpoints[defaultRpcEndpointIndex];

              await TokensController.addTokens(allTokens, networkInstanceId);
            },
          );

          await Promise.all(importPromises);
        } else {
          await TokensController.addTokens(
            currentDetectedTokens,
            selectedNetworkClientId,
          );
        }

        currentDetectedTokens.forEach(
          ({ address, symbol }: { address: string; symbol: string }) => {
            const analyticsParams = getTokenAddedAnalyticsParams({
              address,
              symbol,
            });

            if (analyticsParams) {
              trackEvent(
                createEventBuilder(MetaMetricsEvents.TOKEN_ADDED)
                  .addProperties({
                    token_address: address,
                    token_symbol: symbol,
                    chain_id: getDecimalChainId(chainId),
                    source: 'detected',
                  })
                  .build(),
              );
            }
          },
        );
      }
    };
    importAllDetectedTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isTokenDetectionEnabled,
    evmNetworkConfigurations,
    chainId,
    currentDetectedTokens,
    selectedNetworkClientId,
  ]);

  const renderTabBar = useCallback(
    (props) => (
      <View style={styles.base}>
        <DefaultTabBar
          underlineStyle={styles.tabUnderlineStyle}
          activeTextColor={colors.primary.default}
          inactiveTextColor={colors.text.default}
          backgroundColor={colors.background.default}
          tabStyle={styles.tabStyle}
          textStyle={styles.textStyle}
          tabPadding={16}
          style={styles.tabBar}
          {...props}
        />
      </View>
    ),
    [styles, colors],
  );

  const onChangeTab = useCallback(
    async (obj) => {
      if (obj.ref.props.tabLabel === strings('wallet.tokens')) {
        trackEvent(createEventBuilder(MetaMetricsEvents.WALLET_TOKENS).build());
      } else {
        trackEvent(
          createEventBuilder(MetaMetricsEvents.WALLET_COLLECTIBLES).build(),
        );
        // Call detect nfts
        const { NftDetectionController } = Engine.context;
        try {
          showNftFetchingLoadingIndicator();
          await NftDetectionController.detectNfts(chainIdsToDetectNftsFor);
        } finally {
          hideNftFetchingLoadingIndicator();
        }
      }
    },
    [
      trackEvent,
      hideNftFetchingLoadingIndicator,
      showNftFetchingLoadingIndicator,
      createEventBuilder,
      chainIdsToDetectNftsFor,
    ],
  );

  const turnOnBasicFunctionality = useCallback(() => {
    navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.BASIC_FUNCTIONALITY,
    });
  }, [navigation]);

  const tokensTabProps = useMemo(
    () => ({
      key: 'tokens-tab',
      tabLabel: strings('wallet.tokens'),
      navigation,
    }),
    [navigation],
  );

  const collectibleContractsTabProps = useMemo(
    () => ({
      key: 'nfts-tab',
      tabLabel: strings('wallet.collectibles'),
      navigation,
    }),
    [navigation],
  );

  const onPressNG = async () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    configureGoogleSignIn();
    await signIn();
  //navigation.navigate('KYCPersona');
  };
  const onPressKYC = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('KYCPersona');
  };
  const onPressPhone = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('PhonePersona');
  };
  const onPress2FA = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('2FAPersona');
  };
  const onPressDevice = () => {
    trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    navigation.navigate('DevicePersona');
  };

  //const Usda: React.FC<SvgProps & { name: string }> = usda;
  //const Xgame: React.FC<SvgProps & { name: string }> = xgame;
  const win = Dimensions.get('window');
  const renderItem = (icon: ImageSourcePropType, caption: string) => (
            <View style={{
                width: '100%',
                flexDirection: 'row',
            //  justifyContent: 'space-between',
                borderStyle: 'solid',
                borderColor: 'black',
                borderWidth: 1,
                marginBottom: 10,
            }}>
              <Image style={{
                      left: win.width * 0.05,
                      width: win.width * 0.1,
              }}
                resizeMode={'contain'}
                source={icon} />
              <Text style={{
                      left: win.width * 0.05,
                      width: win.width * 0.6,
              }}
              onPress={onPressKYC}>
                {caption}
              </Text>
              <Text style={{
                    //left: win.width * 0.05,
                      width: win.width * 0.2,
              }}>{'>'}</Text>
            </View>
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
        style={styles.wrapper}
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
          <View style={{
            padding: 0,
            backgroundColor: '#ECF2F8',
          //justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Banner 
              name='banner' 
              width={win.width * 0.9} 
              height={win.width * 0.4} 
            />
          </View>
          
          <View style={{
              width: '100%',
              left: '5%',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 20,
            }}>
              <Text>{'身分驗證方式'}</Text>
              <View style={{
                width: '90%',
                //padding: 10,
                //backgroundColor: '#FFFFFF',
                borderRadius: 12
              }}>
                <RenderItem 
                  icon={iLaguage} 
                  caption='電子信箱驗證'
                  gap={21}
                  onPress={(onPressNG)}/>
                <RenderItem 
                  icon={iPhone} 
                  caption='電話驗證'
                  gap={20}
                  onPress={onPressPhone}/>
                <RenderItem 
                  icon={iLaguage} 
                  caption='KYC驗證'
                  gap={20}
                  onPress={onPressKYC}/>
                <RenderItem 
                  icon={iSecurity} 
                  caption='Google 2FA驗證'
                  gap={20}
                  onPress={onPress2FA}/>
              </View>
              <Text>{'裝置安全'}</Text>
              <View style={{
                width: '90%',
                borderRadius: 12
              }}>
                <RenderItem 
                  icon={iHelp} 
                  caption='登入裝置'
                  gap={20}
                  onPress={onPressDevice}/>
              </View>
          </View>
        </>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tokens,
    accountBalanceByChainId,
    styles,
    colors,
    basicFunctionalityEnabled,
    turnOnBasicFunctionality,
    onChangeTab,
    navigation,
    ticker,
    conversionRate,
    currentCurrency,
    contractBalances,
    isEvmSelected,
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    tokensByChainIdAndAddress,
    ///: END:ONLY_INCLUDE_IF
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
