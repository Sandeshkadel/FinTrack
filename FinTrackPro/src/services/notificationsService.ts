import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationsService = {
  async requestPermission(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.granted) return true;
      const req = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      return req.granted;
    } catch {
      return false;
    }
  },

  async scheduleBudgetAlert(category: string, usedPercent: number): Promise<void> {
    if (usedPercent < 85) return;
    const isOver = usedPercent >= 100;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isOver ? `⚠️ Budget exceeded: ${category}` : `⚠️ Budget near limit: ${category}`,
        body: isOver
          ? `You've exceeded your ${category} budget (${usedPercent.toFixed(0)}%).`
          : `You've used ${usedPercent.toFixed(0)}% of your ${category} budget.`,
        sound: 'default',
      },
      trigger: { seconds: 1 },
    });
  },

  async scheduleSavingsReminder(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 Daily savings tip',
        body: 'Track an expense or income today to keep your streak going!',
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    });
  },

  async scheduleMonthlySummary(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Monthly summary ready',
        body: 'Tap to view your monthly income and spending report.',
      },
      trigger: {
        day: 1,
        hour: 9,
        minute: 0,
        repeats: true,
      } as any,
    });
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};