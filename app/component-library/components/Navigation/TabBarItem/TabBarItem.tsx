/* eslint-disable react/prop-types */

// Third party dependencies.
import React from 'react';
import { TouchableOpacity } from 'react-native';

// External dependencies.
import { useStyles } from '../../../hooks';

// Internal dependencies
import styleSheet from './TabBarItem.styles';
import { TabBarItemProps } from './TabBarItem.types';
import Avatar, { AvatarVariant } from '../../Avatars/Avatar';
import Text from '../../Texts/Text';

const TabBarItem = ({
  style,
  icon,
  label,
  iconSize,
  iconColor,
  iconBackgroundColor,
  ...props
}: TabBarItemProps) => {
  const { styles } = useStyles(styleSheet, { style });

  return (
    <TouchableOpacity {...props} style={styles.base}>
      <Avatar
        variant={AvatarVariant.Icon}
        name={icon}
        size={iconSize}
        backgroundColor={iconBackgroundColor}
        iconColor={iconColor}
      />
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

export default TabBarItem;
