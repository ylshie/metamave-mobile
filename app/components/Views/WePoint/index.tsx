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
  TextInput,
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
import LinearGradient from 'react-native-linear-gradient'
import useCopyClipboard from '../Notifications/Details/hooks/useCopyClipboard';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swap from './images/swap.svg'
import Arena from './images/arena.svg'
import WeZan from './images/wezan.svg'
import WPoint from './images/wpoint.svg'
import { relative } from 'path';
import { title } from 'process';
import { wzInfo } from '../WeSignup/account';
import StorageWrapper from '../../../store/storage-wrapper';
import Approve from '../confirmations/legacy/Approve';
import { TransactionApproval, TransactionModalType } from '../../Approvals/TransactionApproval';
import approveTransaction from '../../../core/DeeplinkManager/TransactionManager/wzApproveTransaction';
import { address } from '@solana/addresses';
import { wzPoint, wzCoin } from '../WeSignup/account';
import { value } from '../../Snaps/SnapUIRenderer/components/value';
import { selectContractBalances } from '../../../selectors/tokenBalancesController';
import { BigNumber, ethers } from 'ethers';
import { Catt } from '../WeWallet/catt';
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

const ConvertRate = 10000.0;
const Item = ({tag, balance, value, icon, name, onChangeValue} : {
  tag: string,
  balance: number,
  value: number,
  icon: ReactNode,
  name: string,
  onChangeValue?: ((value: number) => void) | undefined 
}) => {
  const onChangeText = (text: string) => {
    const value = parseFloat(text)
    if (onChangeValue) onChangeValue(isNaN(value)? 0: value)
  }
  return <View style={{
    width: '100%',
    backgroundColor: '#F6F7FB',
    borderRadius: 10,
    borderStyle: 'solid',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  }}>
    <View>
      <Text style={{
        color: '#272727',
        fontSize: 14,
        fontWeight: '400'
      }}>{tag}</Text>
      <TextInput
        keyboardType="numeric" 
        style={{
          color: '#000000',
          fontSize: 24,
          fontWeight: '600',
        }}
        onChangeText={onChangeText}
      >
        {value}
      </TextInput>
      <Text style={{
        color: '#575757',
        fontSize: 14,
        fontWeight: '400'
      }}>剩餘點數: {balance}</Text>
    </View>
    <View style={{
      flexDirection: 'row'
    }}>
      {icon}
      <Text style={{
        color: '#575757',
        fontSize: 16,
        fontWeight: '400',
      }}>{name}</Text>
    </View>
  </View>
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
  const [swap, setSwap] = useState(false)
  const [walue, setWalue] = useState(0)
  const [aalue, setAalue] = useState(0)
  const [walance, setWalance] = useState(0)  // 6432
  const [aelance, setAelance] = useState(0)
  const [callback, setCallback] = useState<()=>void>()

  const contractBalances = useSelector(selectContractBalances);
  //console.log('contractBalances', contractBalances)

  const iWPoint = {
    name: 'wPoint',
    icon: <WPoint name='wpoint' width={24} height={24}/>,
  //balance: 6432,
  }
  const iArena = {
    name: 'Wezan',
    icon: <WeZan name='arena' width={24} height={24}/>,
  //balance: 0,
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

  async function QueryCode() {
    const token   = await StorageWrapper.getItem('accessToken');
    const account = await StorageWrapper.getItem('account');
    const data    = await wzInfo(token, account)
  //console.log('QueryCode', data)
    setWalance(data.info.point)
  }
  useEffect(()=>{
    QueryCode()
  })
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

  useEffect(() => {
  //  setAalue(walue / 1000.0)
  }, [walue, aalue])
  useEffect(() => {
  //  setWalue(aalue * 1000.0)
  }, [aalue, walue])
  
  useEffect(()=>{
  //const value   = contractBalances['0x36D5E58F99C5e1468FFD447E5f6E8B05d7DCdFa4']
    const value   = contractBalances[Catt.address]
    const big     = value? BigNumber.from(value): 0
    const units   = ethers.utils.formatUnits(big, 18)
    const balance = Number(units)
    console.log(Date.now(), '~~ wzPoint ~~', 'contractBalances updated', contractBalances)
    setAelance(balance)
  }, [contractBalances])

  const onChangeWalue = (value: number) => {
    setWalue(value)
    setAalue(value /ConvertRate)
  }
  const onChangeAalue = (value: number) => {
    setAalue(value)
    setWalue(Math.floor(value * ConvertRate))
  }
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

  const Icon = <Image style={{
                        left: win.width * 0.01,
                        width: win.width * 0.6,
                      }}
                      resizeMode={'contain'}
                      source={require('./verify.png')} 
                    />
  const onPressSwap = async () => {
    const { AccountTrackerController, AccountsController } = Engine.context;
    const account = AccountsController.getSelectedAccount().address
  //const account = '0x6B9eA60821bd0214A6e63cA848869528d5A554F9'

    const RefreshToken = async () => {
      let done = false;
      console.log(Date.now(), '~~ Refresh start ~~')
      try {
        const config    = evmNetworkConfigurations[chainId as `0x${string}`]
        const networkId = config.rpcEndpoints[config.defaultRpcEndpointIndex].networkClientId;
        console.log(Date.now(), '~~ Refresh trace ~~', networkId, config)
        await AccountTrackerController.refresh(networkId);
        done = true;
        console.log(Date.now(), '~~ Refresh single done ~~')
      } catch (error) {
        console.log(Date.now(), '~~ Refresh single error ~~')
        done = false;
      }
      if (! done) {
        await AccountTrackerController.refresh()
        console.log(Date.now(), '~~ Refresh all done ~~')
      }
    }
    const PointToCoin = async () => {
      const token   = await StorageWrapper.getItem('accessToken');
      const target  = account
      try {
        const tx  = await wzPoint(token, target, walue)
        console.log('wzPoint', tx)
        await QueryCode()
        /*
        Object.values(evmNetworkConfigurations).forEach(
          ({ defaultRpcEndpointIndex, rpcEndpoints }) => {
            AccountTrackerController.refresh(
              rpcEndpoints[defaultRpcEndpointIndex].networkClientId,
            );
          },
        );
        */
      //AccountTrackerController.refresh() // remove await
        const config = evmNetworkConfigurations[chainId as `0x${string}`]
        /*
        AccountTrackerController.refresh(
          config.rpcEndpoints[config.defaultRpcEndpointIndex].networkClientId,
        );
        */
        RefreshToken()
        return {ok: tx.ok, tx}
      } catch (error) {
        return {ok: false, error}
      }
    }
    const CoinToPoint = async () => {
      console.log('aalue=', aalue)
      const token   = await StorageWrapper.getItem('accessToken');
      const source  = account
      try {
        const tx   = await wzCoin(token, source, aalue)
        console.log('wzCoin', tx)
        await QueryCode()
      //AccountTrackerController.refresh() // remove await
        /*
        const config = evmNetworkConfigurations[chainId as `0x${string}`]
        AccountTrackerController.refresh(
          config.rpcEndpoints[config.defaultRpcEndpointIndex].networkClientId,
        );
        */
        RefreshToken()
        return {ok: true, tx}
      } catch (error) {
        console.log('wzCoin error', error)
        return {ok: false, error}
      }
    }
    console.log('===SWAP===', account, swap? 'CoinToPoint': 'PointToCoin', swap? aalue: walue)
    if (swap) {
      const chain = Catt.chain;  //'0xa4b1'
      const res = await approveToken(chain, drain_address, aalue)
      if (! res) {
        console.log('User cancel token approval')
        return
      }
    }
    
    console.log('~~ wzPoint ~~~', 'evmNetworkConfigurations=', evmNetworkConfigurations)
    console.log('~~ wzPoint ~~~', 'chainId=', chainId)

    navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.MODAL.WE_WAITER,
      params: {
        head: '審核資料',
        title: '兌換中',
        foot: '兌換中請勿返回，請耐心等候',
        ready: {
          head: '兌換完成',
          title: 'Congrats!',
          foot: '您已成功兌換完成!',
          icon: Icon,
        },
        notify: swap? CoinToPoint: PointToCoin,
      }
    });
  }
  
  const drain_address   = '0x604A6e47EF487234606aeb76715cc10Ff7C08A96'

  const onPressTest = async () => {
    const chain_id = '0xa4b1'
    return await approveToken(Catt.chain, drain_address, 1.0)
  }
  const approveToken = async (chain_id: `${number}`, spender: string, amount: number) => {
    const value = ethers.utils.parseUnits(amount.toString());
  //const target_address  = "0x36d5e58f99c5e1468ffd447e5f6e8b05d7dcdfa4"
    const target_address  = Catt.address
    
    const parameters = {
      address: spender,
      uint256: value.toString(), //'1000000000000000000',
    }
    console.log("approveToken", parameters)
    
    try {
      const tx = await approveTransaction({parameters, target_address, chain_id})
      console.log("approveTransaction", 'tx=', tx)
      const rx = await tx.result
      console.log("approveTransaction", 'rx=', rx)
      return rx
    } catch (error) {
      console.log("error", error)
      return null
    }
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
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 20,
          ...styles.wrapper
        }}
        testID={WalletViewSelectorsIDs.WALLET_CONTAINER}
      >
        <Text style={{
          width: '100%',
          textAlign: 'left',
          fontSize: 20,
          fontWeight: '600',
        }}>WPoint積分兌換</Text>
        <View style={{
          position: 'relative',
          width: '100%',
          marginTop: 10,
          marginBottom: 10,
        }}>
          <Item tag='From' 
                balance = {swap? aelance: walance} 
                value   = {swap? aalue: walue}
                icon    = {swap? iArena.icon: iWPoint.icon}
                name    = {swap? iArena.name: iWPoint.name}
                onChangeValue = { swap? onChangeAalue: onChangeWalue}
          />
          <View style={{
            height: 10,
          }}/>
          <Item tag='To' 
                balance = {swap? walance: aelance} 
                value   = {swap? walue: aalue}
                icon    = {swap? iWPoint.icon: iArena.icon}
                name    = {swap? iWPoint.name: iArena.name}
                onChangeValue = { swap? onChangeWalue: onChangeAalue}
          />
          {
          <View style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: "box-none" // Let parent not to receive event
          }}>
            <TouchableOpacity onPress={()=> setSwap(! swap)}>
              <Swap name='swap' width={34} height={34}/>
            </TouchableOpacity>
          </View>
          }
        </View>
        
        <View style={{
          position: 'relative',
          width: '100%',
        }}>
          <TouchableOpacity
            onPress={onPressSwap}
            style={{
              borderRadius: 30,
              padding: 10,
              backgroundColor: '#264C98'
            }}
          >
            <Text style={{
              width: '100%',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '400',
              textAlign: 'center',
            }}>兌換</Text>
          </TouchableOpacity>
          
          <View style={{
            width: '100%',
            height: 20,
          }}/>
          {/*
            <TouchableOpacity
              onPress={onPressTest}
              style={{
                borderRadius: 30,
                padding: 10,
                backgroundColor: '#264C98'
              }}
            >
              <Text style={{
                width: '100%',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '400',
                textAlign: 'center',
              }}>Test</Text>
            </TouchableOpacity>
          */}
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
