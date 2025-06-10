/* eslint-disable @typescript-eslint/no-require-imports */
import React, {
  useEffect,
  useRef,
  useCallback,
  useContext,
  ReactChildren,
} from 'react';
import {
  ActivityIndicator,
  View,
  Linking,
  TextInput,
  ImageSourcePropType,
  ScrollView,
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
import Circle from './images/circle.svg'
import Done from './images/done.svg'
//import Apple from './images/apple.svg'
//import Twitter from './images/twitter.svg'
//import Telegram from './images/telegram.svg'

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
const MySocial = ({
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
      getPersonaNavbar(navigation, route, colors, 'VIP權益說明')
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
  const RenderTitle = ({title}: {title: string}) => {
    return  <View style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                  }}>
              <Circle name='circle' width={32} height={32}/>
              <View style={{
                backgroundColor: '#F78106',
                borderRadius: 20,
                paddingTop: 5,
                paddingBottom: 5,
                paddingRight: 30,
                paddingLeft: 30,
                marginLeft: 10,
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '400',
                //backgroundColor: 'red',
                }}>{title}</Text>
              </View>
            </View>
  }
  const RenderLevel = ({level}:{level: number}) => {
    return  <Text style={{
                  color: '#000000',
                  fontSize: 52,
                  lineHeight: 60,
                  fontWeight: '800',
                }}
            >
              LV{level}
            </Text>
  }
  const RenderCondition = ({cond}:{cond: string}) => {
    return <>
              <View style={{
                marginBottom: 5,
              }}>
                <Text style={{
                      color: '#828282',
                      fontSize: 18,
                      fontWeight: '600',
                    }}>
                升級條件
              </Text>
              </View>
              <Text style={{
                      color: '#000000',
                      fontSize: 18,
                      fontWeight: '600',
                    }}>
                {cond}
              </Text>
    </>
  }
  const RenderMerit = ({text}: {text:string}) => {
    return  <View style={{
              flexDirection: 'row',
            }}>
              <Done name='done' width={24} height={24}/>
              <Text style={{
                color: '#000000',
                fontSize: 18,
                fontWeight: '500',
              }}>{text}</Text>
            </View>
  }
  const RenderMember = ({title, level, cond, children}:
                        { 
                          title: string, 
                          level: number,
                          cond: string,
                          children: React.ReactNode | string
                        }) => {
  
    return  <View style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderWidth: 1, 
                borderStyle: 'solid', 
                borderColor: '#000000',
                borderRadius: 25,
                padding: 25,
              }}
            >
              <View style={{
                marginBottom: 20,
              }}>
                <RenderTitle title={title}/>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <RenderLevel level={level}/>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <RenderCondition cond={cond}/>
              </View>
              <View style={{
                marginTop: 20,
                marginBottom: 10,
              }}>
                <Text style={{
                  color: '#000000',
                  fontSize: 18,
                  fontWeight: '700',
                }}>
                權益
                </Text>
                {children}
              </View>
          </View>
  }
  const Item = ({text}: {text:string}) => 
    <Text style={{
      fontSize: 15,
      fontWeight: '500',
    }}>
      {text}
    </Text>
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
          width: '100%',
          alignItems: 'center',
          ...styles.wrapper
        }}
        testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
      >
        <ScrollView
          style={{
            width: '100%',
          }}
          contentContainerStyle={{
          //justifyContent: 'center',
          //alignItems: 'center',
          //paddingTop: 60,
          //paddingBottom: 70,
          }}
        >
          <View style={{marginTop: 20}}>
            <RenderMember 
              title='普通會員' 
              level={0}
              cond='免費註冊'
            >
              <RenderMerit text='積分抽獎'/>
              <RenderMerit text='積分換禮品'/>
              <RenderMerit text='基本遊戲功能'/>
            </RenderMember>
          </View>
          <View style={{marginTop: 20}}>
            <RenderMember 
                title='進階會員' 
                level={1}
                cond='近30天累計消費積分 ≥ 10,000'
            >
              <RenderMerit text='積分抽獎'/>
              <RenderMerit text='積分換禮品'/>
              <RenderMerit text='抽獎額外 +1 次每日免費機會'/>
              <RenderMerit text='特殊禮品兌換資格'/>
              <RenderMerit text='基本遊戲功能'/>
            </RenderMember>
          </View>
          <View style={{marginTop: 20}}>
            <RenderMember 
                title='VIP會員' 
                level={2}
                cond='近30天累計消費積分 ≥ 50,000'
            >
              <RenderMerit text='積分抽獎'/>
              <RenderMerit text='積分換禮品'/>
              <RenderMerit text='每筆積分消費額外 3% 積分回饋'/>
              <RenderMerit text='專屬 VIP 活動邀請'/>
              <RenderMerit text='抽獎額外 +2 次每日免費機會'/>
            </RenderMember>
          </View>
          <View style={{
                  padding: 10,
                  marginTop: 20
                }
          }>
            <Text style={{
              fontSize: 18,
            }}>「消費積分」說明:</Text>
            <Text>&nbsp;</Text>
            <Item text='為用戶於平台內發生的積分消耗行為，包括：'/>
            <Item text='1. U卡消費所獲得的積分（刷 U卡 → 獲積分 → 用積分）'/>
            <Item text='2. 平台內參加抽獎、遊戲下注、兌換禮品、直播刷禮物等積分支出'/>
            <Item text='可設定不同權重：'/>
            <Item text='- U卡消費 1U = 2 消費積分（雙倍計算）'/>
            <Item text='- 平台內積分支出 1 積分 = 1 消費積分'/>
          </View>
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(MySocial);
