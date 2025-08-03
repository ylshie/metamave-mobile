import type { Theme } from '@metamask/design-tokens';
import {
  StyleSheet,
  TextStyle,
} from 'react-native';
import Text, {
  TextColor,
  getFontFamily,
  TextVariant,
} from '../../../component-library/components/Texts/Text';

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

export default createStyles;
