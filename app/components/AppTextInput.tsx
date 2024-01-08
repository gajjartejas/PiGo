import React, { forwardRef, memo, useEffect, useState } from 'react';
import {
  Text,
  TextInputProps,
  View,
  StyleSheet,
  ViewStyle,
  TextInputFocusEventData,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { black } from 'react-native-paper/lib/typescript/src/styles/themes/v2/colors';

interface IAppTextInputProps extends TextInputProps {
  errorText?: string | null;
  viewOnly?: boolean;
  containerStyle?: ViewStyle;
  RightAccessoryView?: React.JSX.Element;
  onPress?: () => void;
}

const AppTextInput = forwardRef<TextInput, IAppTextInputProps>((props, ref) => {
  const theme = useTheme();
  const { errorText, containerStyle, onBlur, onFocus, RightAccessoryView, onPress, viewOnly, ...otherProps } = props;
  const [isFocused, setIsFocused] = useState(false);
  const [isBlured, setIsBlured] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // or some other action
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // or some other action
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleOnBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsBlured(true);
    setIsFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  };

  const handleOnFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    setIsBlured(false);
    if (onFocus) {
      onFocus(event);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.titleTextStyle,
          { color: isFocused && !isBlured ? theme.colors.primary : `${theme.colors.onBackground}cc` },
        ]}>
        {props.placeholder}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.textInputContainer,
          !viewOnly && {
            borderBottomColor: isFocused && !isBlured ? theme.colors.primary : `${theme.colors.onBackground}50`,
          },
        ]}>
        <TextInput
          ref={ref}
          pointerEvents={onPress || viewOnly ? 'none' : 'auto'}
          editable={!onPress && !viewOnly}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholderTextColor={`${theme.colors.onBackground}40`}
          {...otherProps}
          style={[styles.textInput, { color: theme.colors.onBackground }, otherProps.style]}
        />
        {RightAccessoryView}
      </TouchableOpacity>

      {isBlured && !!errorText && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorText}</Text>}
    </View>
  );
});

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  container: {},
  textInputContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
  textInput: {
    height: 50,
    flex: 1,
  },
  titleTextStyle: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default memo(AppTextInput);
