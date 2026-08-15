import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '@/config/api';

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#059669',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
      
    try {
      token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      // Save to backend profile
      if (token && token.data) {
        await api.put('/user/push-token', { token: token.data });
        console.log('Push token saved:', token.data);
      }
    } catch (e) {
      console.error('Error fetching push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications (Simulator detected)');
  }

  return token;
}
