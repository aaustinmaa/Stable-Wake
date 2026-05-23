export type NotificationPermissionState = "unknown" | "granted" | "denied";

export type FallbackNotificationStatus =
  | "idle"
  | "scheduled"
  | "disabled"
  | "cancelled"
  | "error";

export type ScheduledFallbackNotification = {
  identifier: string;
  scheduledFor: Date;
};

export type FallbackNotificationState = {
  status: FallbackNotificationStatus;
  permission: NotificationPermissionState;
  scheduledFor: Date | null;
  identifier: string | null;
  errorMessage?: string;
};

export type ScheduleFallbackNotificationResult =
  | {
      status: "scheduled";
      permission: "granted";
      notification: ScheduledFallbackNotification;
    }
  | {
      status: "disabled";
      permission: "denied";
      notification: null;
    }
  | {
      status: "error";
      permission: NotificationPermissionState;
      notification: null;
      errorMessage: string;
    };
