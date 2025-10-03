import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Keyboard,
  View,
  SafeAreaView,
  Image,
  BackHandler,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Text, {
  TextVariant,
} from '../../../component-library/components/Texts/Text';
import StorageWrapper from '../../../store/storage-wrapper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Button, {
  ButtonSize,
  ButtonVariants,
  ButtonWidthTypes,
} from '../../../component-library/components/Buttons/Button';
import { strings } from '../../../../locales/i18n';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import setOnboardingWizardStepUtil from '../../../actions/wizard';
import { setAllowLoginWithRememberMe as setAllowLoginWithRememberMeUtil } from '../../../actions/security';
import { useDispatch, useSelector } from 'react-redux';
import {
  passcodeType,
  updateAuthTypeStorageFlags,
} from '../../../util/authentication';
import { BiometryButton } from '../../UI/BiometryButton';
import Logger from '../../../util/Logger';
import {
  BIOMETRY_CHOICE_DISABLED,
  ONBOARDING_WIZARD,
  TRUE,
  PASSCODE_DISABLED,
} from '../../../constants/storage';
import Routes from '../../../constants/navigation/Routes';
import { passwordRequirementsMet } from '../../../util/password';
import ErrorBoundary from '../ErrorBoundary';
import { toLowerCaseEquals } from '../../../util/general';
import { Authentication } from '../../../core';
import AUTHENTICATION_TYPE from '../../../constants/userProperties';
import { LoginOptionsSwitch } from '../../UI/LoginOptionsSwitch';
import { createRestoreWalletNavDetailsNested } from '../RestoreWallet/RestoreWallet';
import { parseVaultValue } from '../../../util/validators';
import { getVaultFromBackup } from '../../../core/BackupVault';
import { containsErrorMessage } from '../../../util/errorHandling';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { LoginViewSelectors } from '../../../../e2e/selectors/wallet/LoginView.selectors';
import { useMetrics } from '../../../components/hooks/useMetrics';
import trackErrorAsAnalytics from '../../../util/metrics/TrackError/trackErrorAsAnalytics';
import { downloadStateLogs } from '../../../util/logs';
import {
  trace,
  endTrace,
  TraceName,
  TraceOperation,
} from '../../../util/trace';
import TextField, {
  TextFieldSize,
} from '../../../component-library/components/Form/TextField';
import Label from '../../../component-library/components/Form/Label';
import HelpText, {
  HelpTextSeverity,
} from '../../../component-library/components/Form/HelpText';
import { getTraceTags } from '../../../util/sentry/tags';
import { store } from '../../../store';
import {
  DENY_PIN_ERROR_ANDROID,
  JSON_PARSE_ERROR_UNEXPECTED_TOKEN,
  PASSWORD_REQUIREMENTS_NOT_MET,
  VAULT_ERROR,
  PASSCODE_NOT_SET_ERROR,
  WRONG_PASSWORD_ERROR,
  WRONG_PASSWORD_ERROR_ANDROID,
} from './constants';
import {
  ParamListBase,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useStyles } from '../../../component-library/hooks/useStyles';
import stylesheet from './styles';
import ReduxService from '../../../core/redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { BIOMETRY_TYPE } from 'react-native-keychain';
//import FOX_LOGO from '../../../images/branding/fox.png';
import FOX_LOGO from '../../../images/branding/wezan.png';
import { configureGoogleSignIn, wzRefresh } from '../WeSignup/account';
import Engine from '../../../core/Engine';
import { selectEvmNetworkConfigurationsByChainId } from '../../../selectors/networkController';
//import { MultichainNetworkController } from '@metamask/multichain-network-controller';
import { checkGoogle } from '../WeSignup/account';
import { Catt } from '../WeWallet/catt';
/**
 * View where returning users can authenticate
 */
const Login: React.FC = () => {
  const fieldRef = useRef<TextInput>(null);
  const parentSpanRef = useRef(
    trace({
      name: TraceName.Login,
      op: TraceOperation.Login,
      tags: getTraceTags(store.getState()),
    }),
  );
  const [password, setPassword] = useState('');
  const [biometryType, setBiometryType] = useState<
    BIOMETRY_TYPE | AUTHENTICATION_TYPE | string | null
  >(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometryChoice, setBiometryChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometryPreviouslyDisabled, setBiometryPreviouslyDisabled] =
    useState(false);
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const route =
    useRoute<RouteProp<{ params: { locked: boolean } }, 'params'>>();
  const {
    styles,
    theme: { colors, themeAppearance },
  } = useStyles(stylesheet, {});
  const { trackEvent, createEventBuilder } = useMetrics();
  const dispatch = useDispatch();
  const setOnboardingWizardStep = (step: number) =>
    dispatch(setOnboardingWizardStepUtil(step));
  const setAllowLoginWithRememberMe = (enabled: boolean) =>
    setAllowLoginWithRememberMeUtil(enabled);

  const handleBackPress = () => {
    Authentication.lockApp();
    return false;
  };
  const [token,   setToken]   = useState<string>('')
  const [expire,  setExpire]  = useState<string>('')
  const [refresh, setRefresh] = useState<string>('')
  const [account, setAccount] = useState<string>('')

  useEffect(() => {
    trace({
      name: TraceName.LoginUserInteraction,
      op: TraceOperation.Login,
      parentContext: parentSpanRef.current,
    });

    trackEvent(
      createEventBuilder(MetaMetricsEvents.LOGIN_SCREEN_VIEWED).build(),
    );

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    const getUserAuthPreferences = async () => {
      const authData = await Authentication.getType();

      //Setup UI to handle Biometric
      const previouslyDisabled = await StorageWrapper.getItem(
        BIOMETRY_CHOICE_DISABLED,
      );
      const passcodePreviouslyDisabled = await StorageWrapper.getItem(
        PASSCODE_DISABLED,
      );

      if (authData.currentAuthType === AUTHENTICATION_TYPE.PASSCODE) {
        setBiometryType(passcodeType(authData.currentAuthType));
        setHasBiometricCredentials(!route?.params?.locked);
        setBiometryChoice(
          !(passcodePreviouslyDisabled && passcodePreviouslyDisabled === TRUE),
        );
        setBiometryPreviouslyDisabled(!!passcodePreviouslyDisabled);
      } else if (authData.currentAuthType === AUTHENTICATION_TYPE.REMEMBER_ME) {
        setHasBiometricCredentials(false);
        setRememberMe(true);
        setAllowLoginWithRememberMe(true);
      } else if (authData.availableBiometryType) {
        setBiometryType(authData.availableBiometryType);
        setHasBiometricCredentials(
          authData.currentAuthType === AUTHENTICATION_TYPE.BIOMETRIC &&
            !route?.params?.locked,
        );
        setBiometryPreviouslyDisabled(!!previouslyDisabled);
        setBiometryChoice(!(previouslyDisabled && previouslyDisabled === TRUE));
      }
    };

    getUserAuthPreferences();

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVaultCorruption = async () => {
    // This is so we can log vault corruption error in sentry
    const vaultCorruptionError = new Error('Vault Corruption Error');
    Logger.error(vaultCorruptionError, strings('login.clean_vault_error'));

    const LOGIN_VAULT_CORRUPTION_TAG = 'Login/ handleVaultCorruption:';

    if (!passwordRequirementsMet(password)) {
      console.log('==Password===', 2)
      setError(strings('login.invalid_password'));
      return;
    }
    try {
      setLoading(true);
      const backupResult = await getVaultFromBackup();
      if (backupResult.vault) {
        const vaultSeed = await parseVaultValue(password, backupResult.vault);
        if (vaultSeed) {
          // get authType
          const authData = await Authentication.componentAuthenticationType(
            biometryChoice,
            rememberMe,
          );
          try {
            await Authentication.storePassword(
              password,
              authData.currentAuthType,
            );
            navigation.replace(
              ...createRestoreWalletNavDetailsNested({
                previousScreen: Routes.ONBOARDING.LOGIN,
              }),
            );
            setLoading(false);
            console.log('==Password===', 3)
            setError(null);
            return;
          } catch (e) {
            throw new Error(`${LOGIN_VAULT_CORRUPTION_TAG} ${e}`);
          }
        } else {
          throw new Error(`${LOGIN_VAULT_CORRUPTION_TAG} Invalid Password`);
        }
      } else if (backupResult.error) {
        throw new Error(`${LOGIN_VAULT_CORRUPTION_TAG} ${backupResult.error}`);
      }
    } catch (e: unknown) {
      Logger.error(e as Error);
      setLoading(false);
      console.log('==Password===', 4)
      setError(strings('login.invalid_password'));
    }
  };

  const updateBiometryChoice = async (newBiometryChoice: boolean) => {
    await updateAuthTypeStorageFlags(newBiometryChoice);
    setBiometryChoice(newBiometryChoice);
  };

  const isFocused = useIsFocused();
  
  useEffect(()=> {
    const QueryToken = async () => {
      console.log('=== QueryCode ===')
      try {
        configureGoogleSignIn()
        await checkGoogle()
      } catch ( error ) {
        console.log('===error===', error)
      }
    //await checkGoogle()
      const token   = await StorageWrapper.getItem('accessToken');
      const expire  = await StorageWrapper.getItem('accessTokenExpiresAt');
      const refresh = await StorageWrapper.getItem('refreshToken');
      const account = await StorageWrapper.getItem('account');
      console.log('--- QueryCode ---', token)
      setToken(token)
      setExpire(expire)
      setRefresh(refresh)
      setAccount(account)
    }
    console.log('~~~ QueryCode ~~~', token)
    QueryToken()
  }, [isFocused])

  const checkExpire = () => {
    return true;
    console.log('expire=[', expire, ']')
    if (expire == '') return true
    if (expire == undefined) return true
    
    const limit = new Date(expire)
    return ((Date.now() + 300) > limit.getTime()) 
  }
  const refreshToken = async () => {
    console.log("refreshToken==>", refresh)
    if (refresh == undefined || refresh == '') return
    
    const res = await wzRefresh(refresh)
    if (res.ok) {
      console.log("refreshToken", 'new token', res.data)
      StorageWrapper.setItem('accessToken',  res.data.accessToken)
      StorageWrapper.setItem('refreshToken', res.data.refreshToken)
      StorageWrapper.setItem('accessTokenExpiresAt',  res.data.accessTokenExpiresAt)
      StorageWrapper.setItem('refreshTokenExpiresAt', res.data.refreshTokenExpiresAt)
    } else {
      Alert.alert('Refresh token failed')
    }
  }
  const onLogin = async () => {
    endTrace({ name: TraceName.LoginUserInteraction });
    if (checkExpire()) {
      await refreshToken()
    } else {
      console.log("onLogin", 'no need to refresh token')
    }
    const chain = Catt.chainid
    try {
      //const networkConfigurations = useSelector(
      //  selectEvmNetworkConfigurationsByChainId,
      //);
      //console.log('networkConfigurations', networkConfigurations)
      //engine?.backgroundState?.NetworkController
      console.log('===NetworkController===', 1)
      const { NetworkController } = Engine.context;
      console.log('===NetworkController===', 2)
      const config = NetworkController.getNetworkConfigurationByChainId(chain)
      console.log('===NetworkController===', 3)
      const { MultichainNetworkController } = Engine.context;
      console.log('===NetworkController===', 4)
      const id = config?.rpcEndpoints[0].networkClientId
      console.log('===NetworkController===', 5)
    //const networkClientId = 'c4924a29-76b3-445a-8e71-36b0b4c3a1e2'
      console.log('===NetworkController===', config, id)

      id? await MultichainNetworkController.setActiveNetwork(id):'';
    } catch (error) {
      console.log('error', error)
    }
    try {
      const { TokensController } = Engine.context;
      const tokens = TokensController.state.allTokens
    //console.log('====List===', tokens) 
      
      if (tokens[chain]) {
        //TokensController.addToken(Catt)
        /*
        TokensController.addToken({
          address: '0x36D5E58F99C5e1468FFD447E5f6E8B05d7DCdFa4',
          symbol: 'Catt',
          decimals: 18,
          image: '',
          name: 'Catt'
        });
        */
      }
    } catch (error) {
      console.log('error', error)
    }
    
    try {
      const locked = !passwordRequirementsMet(password);
      if (locked) {
        // This will be caught by the catch block below
        throw new Error(PASSWORD_REQUIREMENTS_NOT_MET);
      }
      if (loading || locked) return;

      setLoading(true);
      console.log('==Password===', 5, password, locked, loading)
      setError(null);
      const authType = await Authentication.componentAuthenticationType(
        biometryChoice,
        rememberMe,
      );

      await trace(
        {
          name: TraceName.AuthenticateUser,
          op: TraceOperation.Login,
          parentContext: parentSpanRef.current,
        },
        async () => {
          await Authentication.userEntryAuth(password, authType);
        },
      );
      Keyboard.dismiss();

      // Get onboarding wizard state
      const onboardingWizard = await StorageWrapper.getItem(ONBOARDING_WIZARD);
      if (onboardingWizard) {
        navigation.replace(Routes.ONBOARDING.HOME_NAV);
      } else {
        setOnboardingWizardStep(1);
        navigation.replace(Routes.ONBOARDING.HOME_NAV);
      }
      // Only way to land back on Login is to log out, which clears credentials (meaning we should not show biometric button)
      setPassword('');
      setLoading(false);
      setHasBiometricCredentials(false);
      fieldRef.current?.clear();
    } catch (loginErr: unknown) {
      const loginError = loginErr as Error;
      const loginErrorMessage = loginError.toString();

      console.log('Login error', loginError)
      if (
        toLowerCaseEquals(loginError, WRONG_PASSWORD_ERROR) ||
        toLowerCaseEquals(loginError, WRONG_PASSWORD_ERROR_ANDROID) ||
        loginErrorMessage.includes(PASSWORD_REQUIREMENTS_NOT_MET)
      ) {
        setLoading(false);
        console.log('==Password===', 6)
        setError(strings('login.invalid_password'));

        trackErrorAsAnalytics('Login: Invalid Password', loginErrorMessage);

        return;
      } else if (loginErrorMessage === PASSCODE_NOT_SET_ERROR) {
        Alert.alert(
          strings('login.security_alert_title'),
          strings('login.security_alert_desc'),
        );
        setLoading(false);
      } else if (
        containsErrorMessage(loginError, VAULT_ERROR) ||
        containsErrorMessage(loginError, JSON_PARSE_ERROR_UNEXPECTED_TOKEN)
      ) {
        try {
          await handleVaultCorruption();
        } catch (vaultCorruptionErr: unknown) {
          const vaultCorruptionError = vaultCorruptionErr as Error;
          // we only want to display this error to the user IF we fail to handle vault corruption
          Logger.error(
            vaultCorruptionError,
            'Failed to handle vault corruption',
          );
          setLoading(false);
          console.log('==Password===', 7)
          setError(strings('login.clean_vault_error'));
        }
      } else if (toLowerCaseEquals(loginError, DENY_PIN_ERROR_ANDROID)) {
        setLoading(false);
        updateBiometryChoice(false);
      } else {
        setLoading(false);
        console.log('==Password===', 8)
        setError(strings('login.invalid_password'));
      //setError(loginErrorMessage);
      }
      Logger.error(loginError, 'Failed to unlock');
    }
    endTrace({ name: TraceName.Login });
  };

  const tryBiometric = async () => {
    endTrace({ name: TraceName.LoginUserInteraction });

    fieldRef.current?.blur();
    try {
      await trace(
        {
          name: TraceName.LoginBiometricAuthentication,
          op: TraceOperation.Login,
          parentContext: parentSpanRef.current,
        },
        async () => {
          await Authentication.appTriggeredAuth();
        },
      );
      const onboardingWizard = await StorageWrapper.getItem(ONBOARDING_WIZARD);
      if (!onboardingWizard) setOnboardingWizardStep(1);
      navigation.replace(Routes.ONBOARDING.HOME_NAV);
      // Only way to land back on Login is to log out, which clears credentials (meaning we should not show biometric button)
      setLoading(true);
      setPassword('');
      setHasBiometricCredentials(false);
      fieldRef.current?.clear();
    } catch (tryBiometricError) {
      setHasBiometricCredentials(true);
      Logger.log(tryBiometricError);
    }
    fieldRef.current?.blur();
  };

  const toggleWarningModal = () => {
    navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.MODAL.DELETE_WALLET,
    });
  };

  const renderSwitch = () => {
    const handleUpdateRememberMe = (rememberMeChoice: boolean) => {
      setRememberMe(rememberMeChoice);
    };

    const shouldRenderBiometricLogin =
      biometryType && !biometryPreviouslyDisabled ? biometryType : null;

    return (
      <LoginOptionsSwitch
        shouldRenderBiometricOption={shouldRenderBiometricLogin}
        biometryChoiceState={biometryChoice}
        onUpdateBiometryChoice={updateBiometryChoice}
        onUpdateRememberMe={handleUpdateRememberMe}
      />
    );
  };

  const handleDownloadStateLogs = () => {
    const fullState = ReduxService.store.getState();

    trackEvent(
      createEventBuilder(MetaMetricsEvents.LOGIN_DOWNLOAD_LOGS).build(),
    );
    downloadStateLogs(fullState, false);
  };

  const shouldHideBiometricAccessoryButton = !(
    biometryChoice &&
    biometryType &&
    hasBiometricCredentials
  );

  return (
    <ErrorBoundary navigation={navigation} view="Login">
      <SafeAreaView style={styles.mainWrapper}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          resetScrollToCoords={{ x: 0, y: 0 }}
          style={styles.wrapper}
        >
          <View testID={LoginViewSelectors.CONTAINER}>
            <TouchableOpacity
              style={styles.foxWrapper}
              delayLongPress={10 * 1000} // 10 seconds
              onLongPress={handleDownloadStateLogs}
              activeOpacity={1}
            >
              <Image
                source={FOX_LOGO}
                style={styles.image}
                resizeMethod={'auto'}
              />
            </TouchableOpacity>

            <Text style={styles.title} testID={LoginViewSelectors.TITLE_ID}>
              {strings('login.title')}
            </Text>
            <View style={styles.field}>
              <Label
                variant={TextVariant.HeadingSMRegular}
                style={styles.label}
              >
                {strings('login.password')}
              </Label>
              <TextField
                size={TextFieldSize.Lg}
                placeholder={strings('login.password')}
                placeholderTextColor={colors.text.muted}
                testID={LoginViewSelectors.PASSWORD_INPUT}
                returnKeyType={'done'}
                autoCapitalize="none"
                secureTextEntry
                ref={fieldRef}
                onChangeText={setPassword}
                value={password}
                onSubmitEditing={onLogin}
                endAccessory={
                  <BiometryButton
                    onPress={tryBiometric}
                    hidden={shouldHideBiometricAccessoryButton}
                    biometryType={biometryType}
                  />
                }
                keyboardAppearance={themeAppearance}
              />
            </View>

            {renderSwitch()}

            {!!error && (
              <HelpText
                severity={HelpTextSeverity.Error}
                variant={TextVariant.BodyMD}
                testID={LoginViewSelectors.PASSWORD_ERROR}
              >
                {error}
              </HelpText>
            )}
            <View
              style={styles.ctaWrapper}
              testID={LoginViewSelectors.LOGIN_BUTTON_ID}
            >
              <Button
                variant={ButtonVariants.Primary}
                width={ButtonWidthTypes.Full}
                size={ButtonSize.Lg}
                onPress={onLogin}
                label={
                  loading ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary.inverse}
                    />
                  ) : (
                    strings('login.unlock_button')
                  )
                }
              />
            </View>

            <View style={styles.footer}>
              <Text variant={TextVariant.HeadingSMRegular} style={styles.cant}>
                {strings('login.go_back')}
              </Text>
              <Button
                style={styles.goBack}
                variant={ButtonVariants.Link}
                onPress={toggleWarningModal}
                testID={LoginViewSelectors.RESET_WALLET}
                label={strings('login.reset_wallet')}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
        <FadeOutOverlay />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default Login;
