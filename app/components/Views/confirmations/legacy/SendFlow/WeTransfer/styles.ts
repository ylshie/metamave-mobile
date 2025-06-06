import { StyleSheet } from 'react-native';
import { fontStyles } from '../../../../../../styles/common';

// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStyles = (colors: any) =>
  StyleSheet.create({
    hidden: { // [Arthur]
      display: 'none',
      height: 0
    },
    wrapper: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    inputWrapper: {
      flex: 0,
      //borderBottomWidth: 1,                   // [Arthur] [remove]
      //borderBottomColor: colors.border.muted, // [Arthur] [remove]
      paddingHorizontal: 8,
    },
    bottomModal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    myAccountsText: {
      ...fontStyles.normal,
      color: colors.primary.default,
      fontSize: 16,
      alignSelf: 'center',
      marginTop: 30,
      marginBottom: 30,
    },
    myAccountsTouchable: {
      padding: 28,
    },
    nextActionWrapper: {
      flex: 1,
      marginBottom: 16,
    },
    buttonNextWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    buttonNext: {
      flex: 1,
      marginHorizontal: 24,
      color: '#FFFFFF',
      backgroundColor: '#E38600', // [Arthur]
    },
    addressErrorWrapper: {
      margin: 16,
    },
    footerContainer: {
      justifyContent: 'flex-end',
      marginBottom: 16,
    },
    warningContainer: {
      marginTop: 20,
      marginHorizontal: 24,
    },
    buyEth: {
      color: colors.primary.default,
      textDecorationLine: 'underline',
    },
    confusabeError: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.error.default,
      backgroundColor: colors.error.muted,
      borderRadius: 8,
    },
    confusabeWarning: {
      borderColor: colors.warning.default,
      backgroundColor: colors.warning.muted,
    },
    confusableTitle: {
      marginTop: -3,
      color: colors.text.default,
      ...fontStyles.bold,
      fontSize: 14,
    },
    confusableMsg: {
      color: colors.text.default,
      fontSize: 12,
      lineHeight: 16,
      paddingRight: 10,
    },
    warningIcon: {
      marginRight: 8,
    },
  });

export default createStyles;
