import React, { PureComponent, useCallback } from 'react';
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
} from 'react-native';
import Text, {
  TextVariant,
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

const createStyles = (colors) =>
  StyleSheet.create({
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

  onPressImport = () => {
    this.props.navigation.navigate('Onboarding');
  };
  onPressVerify = () => {
    this.props.navigation.navigate('Fode');
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
  Title = ({title}) => (
    <Text style={{
      color: '#000000',
      height: 35,
      lineHeight: 35,
      fontSize: 30,
      fontWeight: '700',
    }}>忘記密碼</Text>
  )
  SubTitle = ({caption}) => (
    <Text style={{
      color: '#000000',
      fontSize: 16,
      fontWeight: '400',
    }}>
      不用擔心！請輸入與您的帳戶關聯的電子郵件
      使用驗證碼找回帳戶
    </Text>
  )
  renderContent() {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '90%',
          ...styles.ctas
        }}>
          <View style={{
            marginTop: 30,
            marginBottom: 30,
          }}>
            <this.Title title={'忘記密碼'}/>
          </View>
          <View style={{
            marginTop: 10,
            marginBottom: 30,
          }}>
            <this.SubTitle caption={'不用擔心！請輸入與您的帳戶關聯的電子郵件使用驗證碼找回帳戶'}/>
          </View>
          
          <View style={{
            marginTop: 10,
            marginBottom: 30,
          }}>
            <Text style={{
              color: '#000000',
              fontSize: 14,
              fontWeight: '400',
            }}>電子信箱</Text>
            <TextInput style={styleInput} placeholder={'輸入您的Email或電話號碼'}/>
          </View>
          
          <TouchableOpacity
            onPress={this.onPressVerify}
            style={{
                height: 50,
                backgroundColor: '#007AFF',
                borderRadius: 6,
                justifyContent: 'center',
                alignItems: 'center',
            }}
          >
            <Text style={{
              width: '100%',
              textAlign: 'center',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
            }}>Send code</Text>
          </TouchableOpacity>
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
