import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import type { AlarmSettings } from "../../domain/models/AlarmSettings";
import type { ClockTime } from "../../domain/models/ClockTime";
import type {
  NotificationPermissionState,
  ScheduleFallbackNotificationResult
} from "./notification.types";

const FALLBACK_NOTIFICATION_CHANNEL_ID = "stablewake-fallback";
const FALLBACK_NOTIFICATION_TITLE = "StableWake fallback alarm";
const FALLBACK_NOTIFICATION_BODY = "Latest wake time reached.";

export function getNextClockTimeOccurrence(clockTime: ClockTime, now = new Date()): Date {
  const nextOccurrence = new Date(now);

  nextOccurrence.setHours(clockTime.hour, clockTime.minute, 0, 0);

  if (nextOccurrence.getTime() <= now.getTime()) {
    nextOccurrence.setDate(nextOccurrence.getDate() + 1);
  }

  return nextOccurrence;
}

export async function requestFallbackNotificationPermission(): Promise<NotificationPermissionState> {
  const existingPermission = await Notifications.getPermissionsAsync();

  if (isNotificationPermissionUsable(existingPermission)) {
    return "granted";
  }

  if (existingPermission.status === "denied") {
    return "denied";
  }

  const requestedPermission = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true
    }
  });

  return isNotificationPermissionUsable(requestedPermission) ? "granted" : "denied";
}

export async function scheduleLatestWakeFallback(
  settings: AlarmSettings,
  now = new Date()
): Promise<ScheduleFallbackNotificationResult> {
  try {
    const permission = await requestFallbackNotificationPermission();

    if (permission !== "granted") {
      return {
        status: "disabled",
        permission: "denied",
        notification: null
      };
    }

    await ensureFallbackNotificationChannel();

    const scheduledFor = getNextClockTimeOccurrence(settings.latestWakeTime, now);
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: FALLBACK_NOTIFICATION_TITLE,
        body: FALLBACK_NOTIFICATION_BODY,
        data: { kind: "latestWakeFallback" },
        sound: "default"
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledFor,
        channelId: FALLBACK_NOTIFICATION_CHANNEL_ID
      }
    });

    return {
      status: "scheduled",
      permission,
      notification: {
        identifier,
        scheduledFor
      }
    };
  } catch (error) {
    return {
      status: "error",
      permission: "unknown",
      notification: null,
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function cancelFallbackNotification(identifier: string | null | undefined) {
  if (!identifier) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(identifier);
}

async function ensureFallbackNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(FALLBACK_NOTIFICATION_CHANNEL_ID, {
    name: "StableWake fallback",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 500, 250, 500]
  });
}

function isNotificationPermissionUsable(
  permission: Notifications.NotificationPermissionsStatus
): boolean {
  if (permission.granted) {
    return true;
  }

  const iosStatus = permission.ios?.status;

  return (
    iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}
