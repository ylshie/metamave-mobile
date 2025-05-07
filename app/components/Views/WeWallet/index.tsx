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
} from 'react-native';
import type { Theme } from '@metamask/design-tokens';
import { connect, useSelector } from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { baseStyles } from '../../../styles/common';
import Tokens from '../../UI/Tokens';
import { getWalletNavbarOptions } from '../../UI/Navbar';
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
import WalletAction from '../../UI/WeWalletAction';
import { WalletActionType } from '../../UI/WeWalletAction/WalletAction.types';
import { IconName } from '../../../component-library/components/Icons/Icon';
import { WalletActionsBottomSheetSelectorsIDs } from '../../../../e2e/selectors/wallet/WalletActionsBottomSheet.selectors';
import { AvatarSize } from '../../../component-library/components/Avatars/Avatar';
import styleSheet from '../WalletActions/WalletActions.styles';
import { useStyles } from '../../../component-library/hooks';
import { selectCanSignTransactions } from '../../../selectors/accountsController';
import { isEvmAccountType, SolScope } from '@metamask/keyring-api';
import { isMultichainWalletSnap } from '../../../core/SnapKeyring/utils/snaps';
import { CaipChainId, SnapId } from '@metamask/snaps-sdk';
import { sendMultichainTransaction } from '../../../core/SnapKeyring/utils/sendMultichainTransaction';
import { QRTabSwitcherScreens } from '../WeQRTabSwitcher';
import BottomSheet, {
  BottomSheetRef,
} from '../../../component-library/components/BottomSheets/BottomSheet';
import { swapsUtils } from '@metamask/swaps-controller';
import { swapsLivenessSelector } from '../../../reducers/swaps';
/*--------------------*/
import { Image } from 'react-native';
import { SvgProps } from 'react-native-svg';
import usda from './usda.svg'
import xgame from './xgame.svg'
import { Dimensions } from 'react-native';
/*--------------------*/

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
const MyWallet = ({
  navigation,
  storePrivacyPolicyShownDate,
  shouldShowNewPrivacyToast,
  storePrivacyPolicyClickedOrClosed,
  showNftFetchingLoadingIndicator,
  hideNftFetchingLoadingIndicator,
}: WalletProps) => {
  const { navigate } = useNavigation();
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
      getWalletNavbarOptions(
        walletRef,
        selectedInternalAccount,
        accountName,
        accountAvatarType,
        networkName,
        networkImageSource,
        onTitlePress,
        navigation,
        colors,
        isNotificationEnabled,
        isProfileSyncingEnabled,
        unreadNotificationCount,
        readNotificationCount,
        'WeZan Pay'
      ),
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

  function renderTokensContent() {
    return (
      <ScrollableTabView renderTabBar={renderTabBar} onChangeTab={onChangeTab}>
        <Tokens {...tokensTabProps} />
        {isEvmSelected && (
          <CollectibleContracts {...collectibleContractsTabProps} />
        )}
      </ScrollableTabView>
    );
  }
  const sheetRef = useRef<BottomSheetRef>(null);
  const selectedAccount = useSelector(selectSelectedInternalAccount);
  const canSignTransactions = useSelector(selectCanSignTransactions);
  const sendIconStyle = useMemo(
    () => ({
    //  transform: [{ rotate: '-45deg' }],
      transform: [{ rotate: '0deg' }],
      ...styleActions.styles.icon,
    }),
    [styleActions.styles.icon],
  );
  const onSend = useCallback(async () => {
    trackEvent(
      createEventBuilder(MetaMetricsEvents.SEND_BUTTON_CLICKED)
        .addProperties({
          text: 'Send',
          tokenSymbol: '',
          location: 'TabBar',
          chain_id: getDecimalChainId(chainId),
        })
        .build(),
    );

    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    // Non-EVM (Snap) Send flow
    if (selectedAccount && !isEvmAccountType(selectedAccount.type)) {
      if (!selectedAccount.metadata.snap) {
        throw new Error('Non-EVM needs to be Snap accounts');
      }

      // TODO: Remove this once we want to enable all non-EVM Snaps
      if (!isMultichainWalletSnap(selectedAccount.metadata.snap.id as SnapId)) {
        throw new Error(
          `Non-EVM Snap is not whitelisted: ${selectedAccount.metadata.snap.id}`,
        );
      }

      try {
        await sendMultichainTransaction(
          selectedAccount.metadata.snap.id as SnapId,
          {
            account: selectedAccount.id,
            scope: chainId as CaipChainId,
          },
        );
      } catch {
        // Restore the previous page in case of any error
        sheetRef.current?.onCloseBottomSheet();
      }

      // Early return, not to let the non-EVM flow slip into the native send flow.
      return;
    }
    ///: END:ONLY_INCLUDE_IF

    // Native send flow
    /*  [Arthur]
    closeBottomSheetAndNavigate(() => {
      navigate('SendFlowView');
      ticker && dispatch(newAssetTransaction(getEther(ticker)));
    });
    */
    navigate('SendFlowView');
  }, [
    //closeBottomSheetAndNavigate, // [Arthur]
    navigate,
    //ticker,   // [Arthur]
    //dispatch, // [Arthur]
    trackEvent,
    chainId,
    createEventBuilder,
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    selectedAccount,
    ///: END:ONLY_INCLUDE_IF
  ]);

  const onReceive = useCallback(() => {
    /*  // [Arthur]
    closeBottomSheetAndNavigate(() => {
      navigate(Routes.QR_TAB_SWITCHER, {
        initialScreen: QRTabSwitcherScreens.Receive,
      });
    });
    */
    // Hack
    /*
    navigate(Routes.QR_TAB_SWITCHER, {
      initialScreen: QRTabSwitcherScreens.Receive,
      disableTabber: true,  // [Arthur] {remove tabz}
    });
    */
    navigate('PaymentRequestView', {
      screen: 'PaymentRequest',
    //params: { receiveAsset: receiveAsset },
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
    /*
    navigate('PaymentRequestView', {
      screen: 'PaymentRequest',
      params: { receiveAsset: receiveAsset },
    });
    */
    /*
    trackEvent(
      metrics
        .createEventBuilder(MetaMetricsEvents.RECEIVE_OPTIONS_PAYMENT_REQUEST)
        .build(),
    );
    */
  }, [
    // closeBottomSheetAndNavigate, [Arthur]
    navigate,
    trackEvent,
    chainId,
    createEventBuilder,
  ]);

  const goToSwaps = useCallback(() => {
    /*
    closeBottomSheetAndNavigate(() => {
      navigate('Swaps', {
        screen: 'SwapsAmountView',
        params: {
          sourceToken: swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS,
          sourcePage: 'MainView',
        },
      });
    });
    */
    navigate('Swaps', {
      screen: 'SwapsAmountView',
      params: {
        sourceToken: swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS,
        sourcePage: 'MainView',
      },
    });

    trackEvent(
      createEventBuilder(MetaMetricsEvents.SWAP_BUTTON_CLICKED)
        .addProperties({
          text: 'Swap',
          tokenSymbol: '',
          location: 'TabBar',
          chain_id: getDecimalChainId(chainId),
        })
        .build(),
    );
  }, [
    //closeBottomSheetAndNavigate,
    navigate,
    trackEvent,
    chainId,
    createEventBuilder,
  ]);

  const onPressSwaps = useCallback(() => {
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    if (chainId === SolScope.Mainnet) {
    //  goToBridge(); // turn off first
      return;
    }
    ///: END:ONLY_INCLUDE_IF

    goToSwaps();
  }, [
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    chainId,
    //goToBridge,
    ///: END:ONLY_INCLUDE_IF
    goToSwaps,
  ]);
  const onNothing = useCallback(() => {
    if (chainId === SolScope.Mainnet) {
      return
    }
  }, [chainId])
  
  const Usda: React.FC<SvgProps & { name: string }> = usda;
  const Xgame: React.FC<SvgProps & { name: string }> = xgame;
  const win = Dimensions.get('window');
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
          }}>
            <Image style={{
              left: win.width * 0.05,
              width: win.width * 0.9,
            //height: '90%',
            }}
            resizeMode={'contain'}
            source={require('./card.png')} />
          </View>
          {<PortfolioBalance />}
          <View style={{
            //flexDirection: 'row',
            //justifyContent: 'space-around',
            //alignItems: 'flex-start',
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
            }}>
              <WalletAction
                actionType={WalletActionType.WeSend}
                iconName={IconName.Arrow2Right}
                onPress={onSend}
                iconStyle={sendIconStyle}
                actionID={WalletActionsBottomSheetSelectorsIDs.SEND_BUTTON}
                iconSize={AvatarSize.Md}
                disabled={!canSignTransactions}
              />
              <WalletAction
                actionType={WalletActionType.WeReceive}
                iconName={IconName.Received}
                onPress={onReceive}
                actionID={WalletActionsBottomSheetSelectorsIDs.RECEIVE_BUTTON}
                iconStyle={styleActions.styles.icon}
                iconSize={AvatarSize.Md}
                disabled={false}
              />
              <WalletAction
                actionType={WalletActionType.WeSwap}
                iconName={IconName.SwapHorizontal}
                onPress={onPressSwaps}
                actionID={WalletActionsBottomSheetSelectorsIDs.SWAP_BUTTON}
                //iconStyle={styles.icon}
                iconStyle={styleActions.styles.icon}
                iconSize={AvatarSize.Md}
                disabled={!canSignTransactions || !swapsIsLive}
              />
              <WalletAction
                actionType={WalletActionType.WeCashout}
                iconName={IconName.Received}
                onPress={onReceive}
                actionID={WalletActionsBottomSheetSelectorsIDs.RECEIVE_BUTTON}
                iconStyle={styleActions.styles.icon}
                iconSize={AvatarSize.Md}
                disabled={false}
              />
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
            }}>
              <WalletAction
                actionType={WalletActionType.WePoint}
                iconName={IconName.WePoint}
                onPress={onNothing}
                iconStyle={sendIconStyle}
                actionID={WalletActionsBottomSheetSelectorsIDs.SEND_BUTTON}
                iconSize={AvatarSize.Md}
                disabled={!canSignTransactions}
              />
              <WalletAction
                actionType={WalletActionType.WeFriend}
                iconName={IconName.WeFriend}
                onPress={onNothing}
                actionID={WalletActionsBottomSheetSelectorsIDs.RECEIVE_BUTTON}
                iconStyle={styleActions.styles.icon}
                iconSize={AvatarSize.Md}
                disabled={false}
              />
              <WalletAction
                actionType={WalletActionType.WeSocial}
                iconName={IconName.WeSocial}
                onPress={onNothing}
                actionID={WalletActionsBottomSheetSelectorsIDs.SWAP_BUTTON}
                //iconStyle={styles.icon}
                iconStyle={styleActions.styles.icon}
                iconSize={AvatarSize.Md}
                disabled={!canSignTransactions || !swapsIsLive}
              />
              <WalletAction
                actionType={WalletActionType.WeGame}
                iconName={IconName.WeGame}
                onPress={onNothing}
                actionID={WalletActionsBottomSheetSelectorsIDs.RECEIVE_BUTTON}
                iconStyle={styleActions.styles.icon}
                iconSize={AvatarSize.Md}
                disabled={false}
              />
            </View>
          </View>
          <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 20,
            }}>
            <View style={{
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              width: '48%',
            }}>
              <Text style={{
                paddingTop: 8,
                paddingLeft: 12,
              }}>金融</Text>
              <View style={{
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                backgroundColor: '#D7E3FC',
                width: '100%',
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 12,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Usda name='usda'/>
                  <Text style={{
                    paddingLeft: 4
                  }}>USDA</Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  width: '95%',
                  paddingTop: 8,
                }}>
                  <Text>活期/定期</Text>
                  <Text style={{
                    color: '#E38600',
                  }}>7.36% &gt;</Text>
                </View>
              </View>
            </View>
            <View style={{
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              width: '48%',
            }}>
              <Text style={{
                paddingTop: 8,
                paddingLeft: 12,
              }}>遊戲</Text>
              <View style={{
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                backgroundColor: '#D7E3FC',
                width: '100%',
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 12,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Xgame name='xgame'/>
                  <Text style={{
                    paddingLeft: 4
                  }}>xGame</Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  width: '95%',
                  paddingTop: 8,
                }}>
                  <Text>最高獎勵</Text>
                  <Text style={{
                    color: '#E38600',
                  }}>1000% &gt;</Text>
                </View>
              </View>
            </View>
          </View>
          {/*<Carousel style={styles.carouselContainer} />*/}
          {renderTokensContent()}
          {
            ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
            <SolanaNewFeatureContent />
            ///: END:ONLY_INCLUDE_IF
          }
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

export default connect(mapStateToProps, mapDispatchToProps)(MyWallet);
