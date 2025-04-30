import { StyleSheet } from 'react-native';

import { Colors } from '../../../util/theme/models';

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 24,
      borderColor: '#B7B7B7',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 12,
    },
    text: {
      lineHeight: 20,
      color: colors.text.default,
    },
    message: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
    }
  });

export default createStyles;
