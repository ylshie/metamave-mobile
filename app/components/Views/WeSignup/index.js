import React, { PureComponent, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  BackHandler,
  View,
  ScrollView,
  StyleSheet,
  Image,
  InteractionManager,
  Animated,
  Easing,
  TextInput,
  Alert,
} from 'react-native';
import Text, {
  TextVariant, getFontFamily
} from '../../../component-library/components/Texts/Text';
import StorageWrapper from '../../../store/storage-wrapper';
import StyledButton from '../../UI/StyledButton';
import {
  fontStyles,
  baseStyles,
  colors as importedColors,
} from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import Button from '@metamask/react-native-button';
import { connect } from 'react-redux';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import {
  getTransparentBackOnboardingNavbarOptions,
  getTransparentOnboardingNavbarOptions,
} from '../../UI/Navbar';
import Device from '../../../util/device';
import BaseNotification from '../../UI/Notification/BaseNotification';
import ElevatedView from 'react-native-elevated-view';
import { loadingSet, loadingUnset } from '../../../actions/user';
import { storePrivacyPolicyClickedOrClosed as storePrivacyPolicyClickedOrClosedAction } from '../../../reducers/legalNotices';
import PreventScreenshot from '../../../core/PreventScreenshot';
import WarningExistingUserModal from '../../UI/WarningExistingUserModal';
import { PREVIOUS_SCREEN, ONBOARDING } from '../../../constants/navigation';
import { EXISTING_USER } from '../../../constants/storage';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { withMetricsAwareness } from '../../hooks/useMetrics';
import { Authentication } from '../../../core';
import { ThemeContext, mockTheme } from '../../../util/theme';
import { OnboardingSelectorIDs } from '../../../../e2e/selectors/Onboarding/Onboarding.selectors';

import Routes from '../../../constants/navigation/Routes';
import { selectAccounts } from '../../../selectors/accountTrackerController';
import trackOnboarding from '../../../util/metrics/TrackOnboarding/trackOnboarding';
import { trace, TraceName, TraceOperation } from '../../../util/trace';
import { MetricsEventBuilder } from '../../../core/Analytics/MetricsEventBuilder';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { TouchableOpacity } from 'react-native';
import Eye from './eye.svg'
import Gcon from './google.svg'
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import storageWrapper from '../../../store/storage-wrapper';

const idProd  = '521969317751-frn0aovmv2qposmilrfpil3s017u7595.apps.googleusercontent.com'
const idDebug = '521969317751-5dbab0ujkgs902681lo0bnaek8u56rtm.apps.googleusercontent.com'

if (__DEV__) {
  console.log("=============================\n")
  console.log("DEBUG DEBUG DEBUG DEBUG DEBUG\n")
  console.log("DEBUG DEBUG DEBUG DEBUG DEBUG\n")
  console.log("DEBUG DEBUG DEBUG DEBUG DEBUG\n")
  console.log("DEBUG DEBUG DEBUG DEBUG DEBUG\n")
  console.log("DEBUG DEBUG DEBUG DEBUG DEBUG\n")
  console.log("=============================\n")
} else {
  console.log("=============================\n")
  console.log("RELES RELES RELES RELES RELES\n")
  console.log("RELES RELES RELES RELES RELES\n")
  console.log("RELES RELES RELES RELES RELES\n")
  console.log("RELES RELES RELES RELES RELES\n")
  console.log("RELES RELES RELES RELES RELES\n")
  console.log("=============================\n")
}
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
const signIn = async (callback) => {
  try {
    await GoogleSignin.hasPlayServices();
    const { type, data } = await GoogleSignin.signIn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (type === 'success') {
      console.log('\n=============================\n',{ data }, '\n======================\n')
      //this.setState({ userInfo: data, error: undefined });
      //Alert.alert('ok: name='+data.user.name+' email='+data.user.email+' id='+data.user.id);
      callback();
    } else {
      // sign in was cancelled by user
      setTimeout(() => {
        Alert.alert('cancelled: id='+webClientId);
      }, 500);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
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

const createStyles = (colors) =>
  StyleSheet.create({
    tabUnderlineStyle: {
      height: 2,
      backgroundColor: colors.primary.default,
    },
    tabStyle: {
      paddingBottom: 0,
      paddingVertical: 8,
    },
    tabBar: {
      borderColor: colors.background.default,
    },
    textStyle: {
    //...typography.sBodyMDMedium,
      fontFamily: getFontFamily(TextVariant.BodyMDMedium),
      fontWeight: '500',
    },
    scroll: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 30,
    },
    foxWrapper: {
      width: Device.isIos() ? 90 : 45,
      height: Device.isIos() ? 90 : 45,
      marginVertical: 20,
    },
    image: {
      alignSelf: 'center',
      width: Device.isIos() ? 90 : 45,
      height: Device.isIos() ? 90 : 45,
    },
    largeFoxWrapper: {
      alignItems: 'center',
      marginVertical: 24,
    },
    foxImage: {
      width: 125,
      height: 125,
      resizeMode: 'contain',
    },
    title: {
      textAlign: 'center',
    },
    ctas: {
      flex: 1,
      position: 'relative',
    },
    footer: {
      marginTop: -20,
      marginBottom: 20,
    },
    login: {
      fontSize: 18,
      color: colors.primary.default,
      ...fontStyles.normal,
    },
    buttonDescription: {
      textAlign: 'center',
      marginBottom: 16,
    },
    importWrapper: {
      marginVertical: 16,
    },
    createWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 24,
    },
    buttonWrapper: {
      marginBottom: 16,
    },
    loader: {
      marginTop: 180,
      justifyContent: 'center',
      textAlign: 'center',
    },
    loadingText: {
      marginTop: 30,
      textAlign: 'center',
    },
    modalTypeView: {
      position: 'absolute',
      bottom: 0,
      paddingBottom: Device.isIphoneX() ? 20 : 10,
      left: 0,
      right: 0,
      backgroundColor: importedColors.transparent,
    },
    notificationContainer: {
      flex: 0.1,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
  });

const MyInput = (hint) => (
  <TextInput 
      placeholder={hint}
      style={{
        backgroundColor: '#F2F2F2',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#E5E5E5',
        borderRadius: 3,
      }}
  />
)
const PureInput = ({hint}) => {
  return (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingRight: 8,
      paddingLeft: 8,
      ...styleInput
    }}>
      <TextInput style={{
        fontSize: 14,
        fontWeight: '400',
      }}
                secureTextEntry={false}
                placeholder={hint}
                placeholderTextColor={'#808080'}/>
    </View>
  )
}
const PassInput = ({hint}) => {
  const [hide, setHide] = useState(true)
  const onPress = () => {
    console.log("========>", hide)
    setHide(! hide)
  }
  return (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingRight: 8,
      paddingLeft: 8,
      ...styleInput
    }}>
      <TextInput 
        style={{
          fontSize: 14,
          fontWeight: '400',
        }}
        secureTextEntry={hide}
        placeholder={hint}
        placeholderTextColor={'#808080'}
      />
      <TouchableOpacity onPress={onPress}>
        <Eye name='eye' width={20} height={20}/>
      </TouchableOpacity>
    </View>
  )
}
const Forgot = ({onPress}) => {
    return <Text
            onPress={onPress} 
            style={{
              width: '100%',
              color: '#007AFF',
              fontSize: 12,
              fontWeight: '400',
              textAlign: 'right',
            }}>
            {'忘記密碼?'}
          </Text>
}
const Login = ({onPress}) => {
  return  <View style={{
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#007AFF',
            borderRadius: 6,
          }}>
            <Text
            onPress={onPress}
            style={{
              width: '100%',
              textAlign: 'center',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '700',
            }}>登入</Text>
          </View>
}
const Google = ({onPress}) => {
  return  <TouchableOpacity 
            style={{
              height: 40,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#333333',
              borderRadius: 6,
            }}
            onPress={onPress}
          >
            
              <Gcon name='g' width={20} height={20}/>
              <Text style={{
                textAlign: 'center',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '400',
                paddingLeft: 10,
              }}>使用Google登入</Text>
            
          </TouchableOpacity>
}
const Sigup = ({onPress}) => {
  return  <View style={{
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#007AFF',
            borderRadius: 6,
          }}>
            <Text
            onPress={onPress}
            style={{
              width: '100%',
              textAlign: 'center',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '700',
            }}>註冊</Text>
          </View>
}
const styleInput = {
  backgroundColor: '#F2F2F2',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#E5E5E5',
  borderRadius: 3,
}
/**
 * View that is displayed to first time (new) users
 */
class WeSignup extends PureComponent {
  static propTypes = {
    disableNewPrivacyPolicyToast: PropTypes.func,
    /**
     * The navigator object
     */
    navigation: PropTypes.object,
    /**
     * redux flag that indicates if the user set a password
     */
    passwordSet: PropTypes.bool,
    /**
     * loading status
     */
    loading: PropTypes.bool,
    /**
     * set loading status
     */
    setLoading: PropTypes.func,
    /**
     * unset loading status
     */
    unsetLoading: PropTypes.func,
    /**
     * loadings msg
     */
    loadingMsg: PropTypes.string,
    /**
     * Object that represents the current route info like params passed to it
     */
    route: PropTypes.object,
    /**
     * Metrics injected by withMetricsAwareness HOC
     */
    metrics: PropTypes.object,
  };

  notificationAnimated = new Animated.Value(100);
  detailsYAnimated = new Animated.Value(0);
  actionXAnimated = new Animated.Value(0);
  detailsAnimated = new Animated.Value(0);

  animatedTimingStart = (animatedRef, toValue) => {
    Animated.timing(animatedRef, {
      toValue,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  state = {
    warningModalVisible: false,
    loading: false,
    existingUser: false,
    hidePass: true,
  };

  seedwords = null;
  importedAccounts = null;
  channelName = null;
  incomingDataStr = '';
  dataToSync = null;
  mounted = false;

  warningCallback = () => true;

  showNotification = () => {
    // show notification
    this.animatedTimingStart(this.notificationAnimated, 0);
    // hide notification
    setTimeout(() => {
      this.animatedTimingStart(this.notificationAnimated, 200);
    }, 4000);
    this.disableBackPress();
  };

  disableBackPress = () => {
    // Disable back press
    const hardwareBackPress = () => true;
    BackHandler.addEventListener('hardwareBackPress', hardwareBackPress);
  };

  updateNavBar = () => {
    const { route, navigation } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    navigation.setOptions(
      route.params?.delete
        ? getTransparentOnboardingNavbarOptions(colors)
        : getTransparentBackOnboardingNavbarOptions(colors),
    );
  };

  componentDidMount() {
    this.updateNavBar();
    this.mounted = true;
    this.checkIfExistingUser();
    this.props.disableNewPrivacyPolicyToast();

    InteractionManager.runAfterInteractions(() => {
      PreventScreenshot.forbid();
      if (this.props.route.params?.delete) {
        this.props.setLoading(strings('onboarding.delete_current'));
        setTimeout(() => {
          this.showNotification();
          this.props.unsetLoading();
        }, 2000);
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.unsetLoading();
    InteractionManager.runAfterInteractions(PreventScreenshot.allow);
  }

  componentDidUpdate = () => {
    this.updateNavBar();
  };

  async checkIfExistingUser() {
    const existingUser = await StorageWrapper.getItem(EXISTING_USER);
    if (existingUser !== null) {
      this.setState({ existingUser: true });
    }
  }

  onLogin = async () => {
    const { passwordSet } = this.props;
    if (!passwordSet) {
      await Authentication.resetVault();
      this.props.navigation.replace(Routes.ONBOARDING.HOME_NAV);
    } else {
      await Authentication.lockApp();
      this.props.navigation.replace(Routes.ONBOARDING.LOGIN);
    }
  };

  handleExistingUser = (action) => {
    if (this.state.existingUser) {
      this.alertExistingUser(action);
    } else {
      action();
    }
  };

  onPressCreate = () => {
    const action = () => {
      const { metrics } = this.props;
      if (metrics.isEnabled()) {
        this.props.navigation.navigate('ChoosePassword', {
          [PREVIOUS_SCREEN]: ONBOARDING,
        });
        this.track(MetaMetricsEvents.WALLET_SETUP_STARTED);
      } else {
        this.props.navigation.navigate('OptinMetrics', {
          onContinue: () => {
            this.props.navigation.replace('ChoosePassword', {
              [PREVIOUS_SCREEN]: ONBOARDING,
            });
            this.track(MetaMetricsEvents.WALLET_SETUP_STARTED);
          },
        });
      }
    };

    this.handleExistingUser(action);
  };

  onPressImport = async () => {
  //await onSendCode()
    this.props.navigation.navigate('Onboarding');
  };
  onSendCode = async (code) => {
    try {
      const response = fetch('https://mail.arwaexchange.com/v1/account/gtest/submit?access_token=226150226a5abb88306f8ef022271dc53c1fd7bea73e8d9ac2c859b445db5850', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [
            {
              name: 'Yuliang Hsieh',
              address: 'yuliang.hsieh@gmail.com'
            }
          ],
          subject: 'Verification Code!',
          text: 'Your verification code is '+code,
          html: '<p>Your verification code is '+code+'</p>',
          attachments: [
          ]
        }),
      })
      const json = response.json()
      
      return json
    } catch(error) {
        console.error(error);
    };
  }
  onPressCode = async () => {
    const code = '12345'
    StorageWrapper.setItem('wecode', '12345')
    await this.onSendCode(code)
    this.props.navigation.navigate('Code',{ code: code });
  };
  onPressForgot = () => {
    this.props.navigation.navigate('Forgot');
  };
  onPressNG = async () => {
  //trackEvent(createEventBuilder(MetaMetricsEvents.SETTINGS_GENERAL).build());
    configureGoogleSignIn();
    const next = ()=>this.props.navigation.navigate('Onboarding')
    const hasPreviousSignIn = GoogleSignin.hasPreviousSignIn();
    if (hasPreviousSignIn) {
      //Alert.alert("have been sign in")
      next()
    } else {
      await signIn(next);
    }
  //this.props.navigation.navigate('Onboarding');
  //navigation.navigate('KYCPersona');
  };
  track = (event) => {
    trackOnboarding(MetricsEventBuilder.createEventBuilder(event).build());
  };

  alertExistingUser = (callback) => {
    this.warningCallback = () => {
      callback();
      this.toggleWarningModal();
    };
    this.toggleWarningModal();
  };

  toggleWarningModal = () => {
    const warningModalVisible = this.state.warningModalVisible;
    this.setState({ warningModalVisible: !warningModalVisible });
  };

  renderLoader = () => {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View style={styles.wrapper}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>{this.props.loadingMsg}</Text>
        </View>
      </View>
    );
  };

  renderTabBar = (props) => {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);
    return (
      <View style={styles.base}>
        <DefaultTabBar
          underlineStyle={styles.tabUnderlineStyle}
          activeTextColor={colors.primary.default}
          inactiveTextColor={colors.text.muted}
          backgroundColor={colors.background.default}
          tabStyle={styles.tabStyle}
          tabPadding={16}
          textStyle={styles.textStyle}
          {...props}
        />
      </View>
    );
  };

  onChangeTab = () => {}
  
  Eye = () => (<TextInput.Icon
                name="icon"
                onPress={() => this.setState({hidePass: !this.state.hidePass})}
              />)
  renderContent() {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);
    const { hidePass } = this.state;
    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '90%',
          ...styles.ctas
        }}>
          <Text style={{
            color: '#272727',
            fontSize: 32,
            lineHeight: 35,
            fontWeight: '600',
          }}>登入</Text>
          {
          <ScrollableTabView renderTabBar={this.renderTabBar}>
            <View tabLabel={'登入'}>
              <View style={{
                marginTop: 10,
                marginBottom: 20,
              }}>
                <PureInput hint={'輸入您的Email或電話號碼'}/>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <PassInput hint={'輸入您的密碼'}/>
              </View>
              <View style={{
                justifyContent: 'flex-end'
              }}>
                <Forgot onPress={this.onPressForgot}/>
              </View>
              
              <View style={{
                marginBottom: 20,
              }}>
                <Login onPress={this.onPressImport}/>
              </View>
              
              <Google onPress={this.onPressNG}/>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Text style={{
                  color: '#1A1A1A',
                  fontSize: 12,
                  fontWeight: '400',
                  paddingRight: 5,
                }}>還沒有註冊嗎?</Text>
                <Text style={{
                  color: '#007AFF',
                  fontSize: 12,
                  fontWeight: '400',
                }}>立即註冊</Text>
              </View>
            </View>
            <View tabLabel={'註冊'}>
              <View style={{
                marginTop: 10,
                marginBottom: 20,
              }}>
                <TextInput style={styleInput} placeholder={'輸入您的Email或電話號碼'}/>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <PassInput hint={'建立您的密碼必須8位數以上'}/>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <PassInput hint={'再次輸入您建立的密碼'}/>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <Text>邀請碼</Text>
              </View>
              <View style={{
                marginBottom: 20,
              }}>
                <TextInput style={styleInput} placeholder={'若無邀請碼直接跳過'}/>
              </View>
              <Sigup onPress={this.onPressCode}/>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Text style={{
                  color: '#1A1A1A',
                  fontSize: 12,
                  fontWeight: '400',
                  paddingRight: 10,
                }}>我已經有帳號了</Text>
                <Text style={{
                  color: '#007AFF',
                  fontSize: 12,
                  fontWeight: '400',
                }}>立即登入</Text>
              </View>
            </View>
          </ScrollableTabView>
          }
          {/*
          <StyledButton
            type={'normal'}
            onPress={this.onPressImport}
            testID={OnboardingSelectorIDs.IMPORT_SEED_BUTTON}
          >
            {'Next'}
          </StyledButton>
          */}
        </View>
      </View>
    );
  }

  handleSimpleNotification = () => {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    if (!this.props.route.params?.delete) return;
    return (
      <Animated.View
        style={[
          styles.notificationContainer,
          { transform: [{ translateY: this.notificationAnimated }] },
        ]}
      >
        <ElevatedView style={styles.modalTypeView} elevation={100}>
          <BaseNotification
            closeButtonDisabled
            status="success"
            data={{
              title: strings('onboarding.success'),
              description: strings('onboarding.your_wallet'),
            }}
          />
        </ElevatedView>
      </Animated.View>
    );
  };

  render() {
    const { loading } = this.props;
    const { existingUser } = this.state;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View
        style={baseStyles.flexGrow}
        testID={OnboardingSelectorIDs.CONTAINER_ID}
      >
        <ScrollView
          style={baseStyles.flexGrow}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.wrapper}>
            {loading && (
              <View style={styles.foxWrapper}>
                <Image
                  source={require('../../../images/branding/wezan.png')}
                  style={styles.image}
                  resizeMethod={'auto'}
                />
              </View>
            )}
            {loading ? this.renderLoader() : this.renderContent()}
          </View>
          {existingUser && !loading && (
            <View style={styles.footer}>
              <Button style={styles.login} onPress={this.onLogin}>
                {strings('onboarding.unlock')}
              </Button>
            </View>
          )}
        </ScrollView>

        <FadeOutOverlay />

        <View>{this.handleSimpleNotification()}</View>

        <WarningExistingUserModal
          warningModalVisible={this.state.warningModalVisible}
          onCancelPress={this.warningCallback}
          onRequestClose={this.toggleWarningModal}
          onConfirmPress={this.toggleWarningModal}
        />
      </View>
    );
  }
}

WeSignup.contextType = ThemeContext;

const mapStateToProps = (state) => ({
  accounts: selectAccounts(state),
  passwordSet: state.user.passwordSet,
  loading: state.user.loadingSet,
  loadingMsg: state.user.loadingMsg,
});

const mapDispatchToProps = (dispatch) => ({
  setLoading: (msg) => dispatch(loadingSet(msg)),
  unsetLoading: () => dispatch(loadingUnset()),
  disableNewPrivacyPolicyToast: () =>
    dispatch(storePrivacyPolicyClickedOrClosedAction()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withMetricsAwareness(WeSignup));
