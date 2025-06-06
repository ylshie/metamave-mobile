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
//import { LinearGradient } from "expo-linear-gradient";
import LinearGradient from 'react-native-linear-gradient'
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
      getPersonaNavbar(navigation, route, colors, '個人驗證')
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
  
  const RenderItem = ({icon, caption}: {icon: string, caption: string}) => (
              <View style={{
                width: '100%',
                flexDirection: 'column',
                marginBottom: 10,
              //...styles.debug,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#272729',
                }}>{icon}</Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '400',
                  color: '#8C8D99',
                }}>{caption}</Text>
              </View>
  )
  const styleArticle = {
    color: '#0066F1',
    fontSize: 16,
    fontWeight: '400',
  }
  const Upload = () => (
    <View style={{
      width: '60%',
      backgroundColor: '#E37D00',
      borderRadius: 10,
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <Image style={{
              left: win.width * 0.01,
              width: win.width * 0.05,
            }}
            resizeMode={'contain'}
            source={require('./images/camera.png')}
      />
      <Text style={{
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '500',
      }}>上傳</Text>
    </View>
  )
  const onApply = () => {
    navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.MODAL.WE_ACTIONS,
    });
  }
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
          justifyContent: 'center',
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
          <View style={{
            width: '90%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LinearGradient 
                colors={['#E4E9F5', '#F3F3F3']} 
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderStyle: 'solid', 
                  borderColor: '#B7B7B7',
                  borderRadius: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                }}>
              <View style={{
                width: '100%'
              }}>
                <Text style={{
                  width: '100%',
                  color: '#000000',
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: '500',
                  marginBottom: 5,
                }}>身分驗證</Text>
              </View>
              <Text style={{
                color: '#3D3D3D',
                fontSize: 12,
                fontWeight: '500',
              }}>證件簽發國家/地區</Text>
              <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 5,
                  borderColor: '#B7B7B7',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 5,
              }}>
                <Image style={{
                        left: win.width * 0.01,
                        width: win.width * 0.05,
                }}
                  resizeMode={'contain'}
                  source={require('./images/id.png')} />
                <Text style={{
                  marginLeft: win.width * 0.02,
                  color: '#000000',
                  fontSize: 11,
                  fontWeight: '500',
                }}>身分證</Text>
              </View>
              <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 5,
                  borderColor: '#B7B7B7',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 5,
              }}>
                <Image style={{
                        left: win.width * 0.01,
                        width: win.width * 0.05,
                }}
                  resizeMode={'contain'}
                  source={require('./images/passport.png')} />
                <Text style={{
                  marginLeft: win.width * 0.02,
                  color: '#000000',
                  fontSize: 11,
                  fontWeight: '500',
                }}>護照</Text>
              </View>
            </LinearGradient>
            {/*
            <View style={{
              width: '100%',
              backgroundColor: '#E4E9F5',
              borderRadius: 10
            }}>
              <View style={{
                width: '100%',
              }}>
                <Text style={{
                  width: '100%',
                  color: '#000000',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                }}>身分驗證</Text>
              </View>
              <Text>證件簽發國家/地區</Text>
              <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 5,
                  borderColor: '#B7B7B7',
                  borderWidth: 1,
                  borderStyle: 'solid',
              }}>
                <Text>身分證</Text>
              </View>
              <View style={{
                  backgroundColor: '#5A5A5A',
                  borderRadius: 5,
                  borderColor: '#B7B7B7',
                  borderWidth: 1,
                  borderStyle: 'solid',
              }}>
                <Text>護照</Text>
              </View>
            </View>
            */}
            <Text style={{
              width: '95%',
              color: '#454545',
              fontSize: 11,
              fontWeight: '500',
            }}>
            平台會嚴格對個人資訊進行加密保護，以保證使用者的隱私及安全。
            </Text>
            <Text style={{
              width: '95%',
              color: '#454545',
              fontSize: 11,
              fontWeight: '500',
            }}>
            請您放心個人資訊只會用於驗證用戶身分，從而提供更佳服務品質，決不會對外分享或用於任何用途
            </Text>
            <Text style={{
              width: '100%',
              color: '#000000',
              fontSize: 14,
              fontWeight: '600',
            }}>證件要求:</Text>
            <View style={{
              width: '95%',
              position: 'relative',
              flexDirection: 'column',
            }}>
              <Text style={{
                color: '#686868',
                fontSize: 11,
                fontWeight: '500',
              }}>
              1.請提供政府簽發的有效證件
              </Text>
              <Text style={{
                color: '#686868',
                fontSize: 11,
                fontWeight: '500',
              }}>
              2.請提供證件元件或使用原相機拍攝，不支持使用圖形編輯器處理照片
              </Text>
              <Text style={{
                color: '#686868',
                fontSize: 11,
                fontWeight: '500',
              }}>
              3.確保所有照片內容清晰可見
              </Text>
              <Text style={{
                color: '#686868',
                fontSize: 11,
                fontWeight: '500',
              }}>
              4.圖片大小不超過5MB
              </Text>
            </View>
            
            <Text style={{
              width: '100%',
              color: '#000000',
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'left',
            }}>證件照片</Text>
            <View style={{
              flexDirection: 'row',
              marginBottom: 10,
            }}>
              <View style={{
                width: '45%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Image style={{
                      //left: win.width * 0.01,
                        width: win.width * 0.45,
                }}
                  resizeMode={'contain'}
                  source={require('./images/front.png')} />
                <Text style={{
                  color: '#686868',
                  fontSize: 8,
                  lineHeight: 10,
                  fontWeight: '500',
                }}>
                請上傳證件正面照片
                {"\n"}(護照不需要上傳)
                </Text>
                <Upload />
              </View>
              <View style={{
                width: '45%',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Image style={{
                      //left: win.width * 0.01,
                        width: win.width * 0.35,
                      //...styles.debug,
                }}
                  resizeMode={'contain'}
                  source={require('./images/back.png')} />
                <Text style={{
                  color: '#686868',
                  fontSize: 8,
                  lineHeight: 10,
                  fontWeight: '500',
                  //...styles.debug,
                }}>
                請上傳證件背面照片
                {"\n"} 
                </Text>
                <Upload />
              </View>
            </View>
            <View style={{
              width: '90%',
              backgroundColor: '#264C98',
              borderRadius: 10,
            }}>
              <Text onPress={onApply}
              style={{
                color: '#FFFFFF',
                width: '100%',
                textAlign: 'center',
              }}>
              提交
              </Text>
            </View>
            <Text style={{
              color: '#626262',
              fontSize: 10,
              fontWeight: '500',
            }}>
              預計審核時間:24小時
            </Text>
          </View>       
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
