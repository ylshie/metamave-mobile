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
//import Banner from './images/banner.svg'
import Google from './images/google.svg'
import Apple from './images/apple.svg'
import Twitter from './images/twitter.svg'
import Telegram from './images/telegram.svg'
import Explore from './images/explore.svg'
import LinearGradient from 'react-native-linear-gradient';
import Copy from './images/copy.svg'
import Box from './images/box.svg'
import Banner from './images/banner.svg'
import Badges from './images/allbadges.svg'
import Brone from './images/brone.svg'
import Silver from './images/silver.svg'
import Gold from './images/gold.svg'
import BadgeN from './images/badge_n.svg'
import BadgeA from './images/badge_a.svg'
import BadgeG from './images/badge_g.svg'
import Setting from './images/setting.svg'
import { Level } from './level';
import { Task } from './task';
import { Step } from './step';
import StorageWrapper from '../../../store/storage-wrapper';
import { wzInfo } from '../WeSignup/account';
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
  const [code, setCode] = useState<string>('5D7EW')

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
    console.log('QueryCode', data)
    setCode(data.info.id)
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
  const Invite = ({children}:{children:ReactNode | string}) => (
    <LinearGradient 
      colors={['#3068DB', '#1C3D82']}
      style={{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
      }}
    >
      {children}
    </LinearGradient>
  )
  const Title_1 = ({text}:{text: string}) => (
    <Text style={{
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '700',
    }}>{text}</Text>
  )
  const SubTitle_1 = ({text}:{text: string}) => (
    <Text style={{
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '400',
    }}>{text}</Text>
  )
  const Field = ({children}:{children:ReactNode | string}) => {
    const list  = React.Children.toArray(children)
    const first = list[0];
    const second= (list.length > 2) ? list[1]: <></>;
    const last  = list[list.length - 1];
    return <View style={{
      width: '90%',
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 10,
      margin: 10,
    }}>
      <View style={{
        width: '70%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
      }}>
        {first}
        {second}
      </View>
      <View style={{
        width: '30%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }}>
        {last}
      </View>
    </View>
  }
  const Name = ({caption}:{caption: string}) => (
    <Text style={{
      color: '#000000',
      fontSize: 14,
      fontWeight: '400',
    }}>{caption}</Text>
  )
  const Value = ({caption}:{caption: string}) => (
    <Text style={{
      color: '#777777',
      fontSize: 14,
      fontWeight: '400',
    }}>{caption}</Text>
  )
  const Circle = ({text}:{text:string}) => (
    <View style={{
      width: 158,
      height: 158,
      borderColor: '#F6CD92',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 79,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <LinearGradient 
          colors={['#FFF1DC', '#E38600']}
          style={{
            width: 138,
            height: 138,
            borderRadius: 69,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,
          }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: 64,
          fontWeight: '600',
          lineHeight: 68,
        }}>{text}</Text>
      </LinearGradient>
    </View>
  )
  const Caption = ({text}:{text:string}) => (
    <Text style={{
      color: '#6B6969',
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 34,
    }}>{text}</Text>
  )
  const Center = ({children}:{children: ReactNode}) => (
    <View style={{
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {children}
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
      <ScrollView
        style={{
          width: '100%',
          backgroundColor: '#E4EDFF',
        //alignItems: 'center',
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 60,
        //paddingBottom: 60,
        //...styles.wrapper
        }}
        testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
      >
        <>
          <Banner name='banner' width={200} height={34}/>
          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
          }}>
            <View style={{
              width: '60%',
            }}>
              <Text style={{
                color: '#6B6969',
                fontSize: 20,
                fontWeight: '600',
              }}>邀請好友一起賺</Text>
              <Text style={{
                color: '#6B6969',
                fontSize: 20,
                fontWeight: '800',
              }}>20 USDTA</Text>
              <Text style={{
                color: '#EB7D00',
                fontSize: 20,
                fontWeight: '600',
              }}>成為高階代理人！</Text>
              <View style={{
                width: 30,
                height: 2,
                backgroundColor: '#6B6969',
              }}/>
              <Text style={{
                color: '#808184',
                fontSize: 14,
                fontWeight: '400',
              }}>和朋友一起增值財富</Text>
            </View>
            <View style={{
              width: '40%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/*<Box name='box' width={160} height={160}/>*/}
              <Image
                source={require('./images/box.png')}
                style={{
                  width: 160,
                  height: 160,
                }}
                resizeMode='contain'
              />
            </View>
          </View>
          
          <Invite>
            <Title_1 text='立即分享推薦碼'/>
            <SubTitle_1 text='解鎖更多紅利與專屬分佣！'/>
            <Field>
              <Name caption='推廣碼:'/>
              <Value caption={code}/>
              <Copy name='copy' width={20} height={20}/>
            </Field>
            <Field>
              <Name caption='邀請連結:'/>
              <Value caption={'promote.wezan/'+code}/>
              <Copy name='copy' width={20} height={20}/>
            </Field>
            <Field>
              <Name caption='總邀請人數'/>
              <Text>0</Text>
            </Field>
          </Invite>
          
          <View style={{
            width: '100%',
            flexDirection: 'row',
          //justifyContent: 'center',
          //alignItems: 'center',
            padding: 10,
            marginTop: 20,
          }}>
            <View style={{
              width: '50%',
              justifyContent: 'flex-start'
            }}>
              <Text style={{
                color: '#6B6969',
                fontSize: 30,
                fontWeight: '600',
                lineHeight: 32,
                textAlign: 'left'
              }}>
                成長任務
              </Text>
              <Text style={{
                color: '#6B6969',
                fontSize: 20,
                fontWeight: '600',
                textAlign: 'left'
              }}>
                解鎖更多紅利
              </Text>
              <Text style={{
                color: '#EB7D00',
                fontSize: 20,
                fontWeight: '600',
                textAlign: 'left'
              }}>
                專屬分佣！
              </Text>
            </View>
            {/*<Badges name='badges' width={200} height={120}/>*/}
            <View style={{
              width: '50%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Image
                source={require('./images/allbadges.png')}
                style={{
                  width: 180,
                  height: 124,
                }}
                resizeMode='contain'
              />
            </View>
          </View>
          <View>
            <View style={{
              marginTop: 10,
            }}>
              <Task icon={<BadgeN name='brone' width={66} height={66}/>}
                  title='新手任務'
                  foot='邀請 1 人且完成 KYC'
                  percent={'60%'}
              />
            </View>
            <View style={{
              marginTop: 10,
            }}>
              <Task icon={<BadgeA name='silver' width={66} height={66}/>}
                  title='進階挑戰'
                  foot='累積邀請 10 人 + 每人消費滿 $100'
                  percent={'40%'}
              />
            </View>
            <View style={{
              marginTop: 10,
            }}>
              <Task icon={<BadgeG name='gold' width={66} height={66}/>}
                  title='黃金代理人'
                  foot='月 GMV 達 10,000 USD 且持倉 5,000 ARENA'
                  percent={'20%'}
              />
            </View>
          </View>
          <Text style={{
            color: '#6B6969',
            fontSize: 30,
            fontWeight: '600',
            lineHeight: 34,
            marginTop: 20,
          }}>代理人等級</Text>
          <LinearGradient
            colors={['#1D3F87', '#C5D3F1']} 
            style={{
              padding: 20,
              borderRadius: 10,
              marginTop: 20,
              marginBottom: 20,
            }}>
              <View style={{
                marginTop: 10,
              }}>
                <Level colors={['#792600', '#C25B2B']}
                    icon={<Brone name='gold' width={40} height={40}/>}
                    title='Bronze'
                    subtitle='月 GMV ≥ 2,000 USD'
                    foot='好友的好友消費，可得 0.3%反饋'
                />
              </View>
              <View style={{
                marginTop: 10,
              }}>
                <Level colors={['#757575', '#D2D2D2']}
                   icon={<Silver name='gold' width={40} height={40}/>}
                   title='Silver'
                   subtitle='月 GMV ≥ 5,000 + 持幣 1,000 ARENA'
                   foot='好友的好友消費，可得 0.5%反饋'
                />
              </View>
              <View style={{
                marginTop: 10,
              }}>
                <Level colors={['#B68F0E', '#B68F0F']}
                   icon={<Gold name='gold' width={40} height={40}/>}
                   title='Gold'
                   subtitle='月 GMV ≥ 10,000 + 持幣 5,000 ARENA'
                   foot='好友的好友消費，可得 0.8%反饋'
              />
              </View>
          </LinearGradient>

          <View style={{
            marginTop: 20,
            marginBottom: 30,
          }}>
            <Caption text='可領取獎勵'/>
            <Center>
              <Circle text='10'/>
              <View style={{
                backgroundColor: '#1F438F',
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                marginTop: 10
              }}>
                <Setting name='setting' width={18} height={18}/>
                <Text style={{
                  left: 5,
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '500'
                }}>領取獎勵</Text>
              </View>
            </Center>
          </View>
          
          <Caption text='邀請步驟'/>
          <View style={{
            padding: 10,
            marginTop: 10,
          }}>
            <Step step={1}
                  state={[true, false]} 
                  title='邀請好友' 
                  foot='分享連結或邀請碼給您的朋友'/>
            <Step step={2} 
                  title='完成註冊'
                  state={[false, false]} 
                  foot='您的朋友透過邀請連結或邀請碼完成註冊'/>
            <Step step={3} 
                  title='完成邀請' 
                  state={[false, true]} 
                  foot='完成KYC後進行交易，您都會獲得反饋獎勵'/>
          </View>

          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 12,
          }}>
            <View style={{
              width: '100%',
              marginTop: 20,
            }}>
              <View style={{
                width: '100%',
                flexDirection: 'row'
              }}>
                <Text style={{
                  width: '70%',
                  color: '#6C757D',
                  fontSize: 16,
                  fontWeight: '500',
                }}>總邀請人數</Text>
                <Text style={{
                  width: '30%',
                  color: '#343A40',
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'right',
                }}>12</Text>
              </View>
              <View style={{
                flexDirection: 'row'
              }}>
                <Text style={{
                  width: '70%',
                  color: '#6C757D',
                  fontSize: 16,
                  fontWeight: '500',
                }}>總邀請完成任務人數</Text>
                <Text style={{
                  width: '30%',
                  color: '#0063F5',
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'right',
                }}>05</Text>
              </View>
            </View>
          </View>
          <View style={{
            height: 100,
          }}></View>
        </>
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

export default connect(mapStateToProps, mapDispatchToProps)(MySocial);
