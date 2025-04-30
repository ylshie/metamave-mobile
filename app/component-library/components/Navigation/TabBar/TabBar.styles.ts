// Third party dependencies.
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

// External dependencies.
import { Theme } from '../../../../util/theme/models';
import Device from '../../../../util/device';

// Internal dependencies.
import { TabBarStyleSheetVars } from './TabBar.types';
import { TAB_BAR_HEIGHT } from './TabBar.constants';
/**
 * Style sheet function for TabBar component.
 *
 * @param params Style sheet params.
 * @param params.theme App theme from ThemeContext.
 * @param params.vars Inputs that the style sheet depends on.
 * @returns StyleSheet object.
 */
const styleSheet = (params: { vars: TabBarStyleSheetVars; theme: Theme }) => {
  const {
    vars: { bottomInset },
    theme: { colors },
  } = params;

  const borderStyle: StyleProp<ViewStyle> = Device.isAndroid()
    ? {
        borderWidth: 0.5,
        borderColor: colors.border.muted,
      }
    : {
        shadowColor: colors.overlay.default,
        shadowOpacity: 1,
        shadowOffset: { height: 4, width: 0 },
        shadowRadius: 8,
        flexBasis: 1,
      };

  return StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      height: TAB_BAR_HEIGHT,
      paddingHorizontal: 16,
      marginBottom: bottomInset,
      backgroundColor: colors.background.default,
      borderWidth: 1, // 0.5, // Arthur
      borderColor: 'gray', // Arthur
      borderStyle: 'solid',  // Arthur
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    border: {
      ...borderStyle,
      backgroundColor: colors.background.default,
    //backgroundColor: 'red', // Arthur
    },
  });
};

export default styleSheet;
