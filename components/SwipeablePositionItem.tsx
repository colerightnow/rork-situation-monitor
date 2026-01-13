import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { WatchlistPosition } from '@/contexts/PositionsContext';
import PositionItem from './PositionItem';
import * as Haptics from 'expo-haptics';

interface SwipeablePositionItemProps {
  position: WatchlistPosition;
  onDelete: () => void;
}

const SWIPE_THRESHOLD = 80;
const DELETE_BUTTON_WIDTH = 80;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SwipeablePositionItem({ position, onDelete }: SwipeablePositionItemProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    isOpen.current = false;
  }, [translateX]);

  const openDeleteButton = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(translateX, {
      toValue: -DELETE_BUTTON_WIDTH,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    isOpen.current = true;
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(isOpen.current ? -DELETE_BUTTON_WIDTH : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = gestureState.dx;
        if (isOpen.current) {
          const clampedValue = Math.min(DELETE_BUTTON_WIDTH, Math.max(-DELETE_BUTTON_WIDTH, newValue));
          translateX.setValue(clampedValue);
        } else {
          const clampedValue = Math.min(0, Math.max(-DELETE_BUTTON_WIDTH - 20, newValue));
          translateX.setValue(clampedValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        
        if (isOpen.current) {
          if (gestureState.dx > SWIPE_THRESHOLD / 2) {
            resetPosition();
          } else {
            openDeleteButton();
          }
        } else {
          if (gestureState.dx < -SWIPE_THRESHOLD / 2) {
            openDeleteButton();
          } else {
            resetPosition();
          }
        }
      },
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        if (isOpen.current) {
          openDeleteButton();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  }, [onDelete, translateX]);

  return (
    <View style={styles.container}>
      <View style={[styles.deleteButton, { backgroundColor: colors.bearishText }]}>
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButtonInner}
          testID="delete-button"
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>DELETE</Text>
        </Pressable>
      </View>
      <Animated.View
        style={[
          styles.content,
          { backgroundColor: colors.bg, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <PositionItem
          position={{
            ticker: position.ticker,
            type: position.sentiment === 'bullish' ? 'BUY' : 'SELL',
            mentions: 1,
            entryPrice: position.entryPrice,
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  content: {
    zIndex: 1,
  },
});
