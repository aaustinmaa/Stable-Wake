import "react-native-gesture-handler/jestSetup";
import { Vibration } from "react-native";

Vibration.vibrate = jest.fn();
Vibration.cancel = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");

  return {
    ...actual,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children
  };
});
jest.mock("@react-navigation/native-stack", () => {
  const React = require("react");

  return {
    createNativeStackNavigator: () => {
      const Screen = () => null;
      const Navigator = ({
        children,
        initialRouteName
      }: {
        children: React.ReactNode;
        initialRouteName?: string;
      }) => {
        const screens = React.Children.toArray(children).filter(React.isValidElement);
        const initialScreen =
          screens.find((screen: any) => screen.props.name === initialRouteName) ?? screens[0];
        const [currentRoute, setCurrentRoute] = React.useState(() => ({
          name: initialScreen.props.name,
          params: undefined
        }));

        const activeScreen = screens.find(
          (screen: any) => screen.props.name === currentRoute.name
        ) as any;
        const ActiveComponent = activeScreen.props.component;

        const navigation = {
          addListener: (_eventName: string, listener: () => void) => {
            if (_eventName === "focus") {
              listener();
            }

            return jest.fn();
          },
          push: (name: string, params?: unknown) => setCurrentRoute({ name, params }),
          replace: (name: string, params?: unknown) => setCurrentRoute({ name, params })
        };
        const route = {
          key: currentRoute.name,
          name: currentRoute.name,
          params: currentRoute.params
        };

        return React.createElement(ActiveComponent, { navigation, route });
      };

      return { Navigator, Screen };
    }
  };
});
jest.mock("expo-audio", () => {
  const player = {
    loop: false,
    isLoaded: true,
    volume: 1,
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    remove: jest.fn()
  };

  return {
    __mockAudioPlayer: player,
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    useAudioPlayer: jest.fn(() => player),
    useAudioPlayerStatus: jest.fn(() => ({
      isLoaded: true,
      playing: false
    }))
  };
});
jest.mock("expo-keep-awake", () => ({
  useKeepAwake: jest.fn()
}));
jest.mock("expo-notifications", () => ({
  AndroidImportance: {
    HIGH: 6
  },
  IosAuthorizationStatus: {
    NOT_DETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 3,
    EPHEMERAL: 4
  },
  SchedulableTriggerInputTypes: {
    DATE: "date"
  },
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      granted: true,
      status: "granted"
    })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      granted: true,
      status: "granted"
    })
  ),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve(null)),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("fallback-notification-id")),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve())
}));
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
jest.mock("react-native-screens", () => {
  const { View } = require("react-native");

  return {
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackItem: View,
    HeaderSubview: View,
    enableScreens: jest.fn()
  };
});
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  const SafeAreaInsetsContext = React.createContext({ top: 0, right: 0, bottom: 0, left: 0 });
  const SafeAreaFrameContext = React.createContext({ x: 0, y: 0, width: 320, height: 640 });

  return {
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        SafeAreaInsetsContext.Provider,
        { value: { top: 0, right: 0, bottom: 0, left: 0 } },
        React.createElement(
          SafeAreaFrameContext.Provider,
          { value: { x: 0, y: 0, width: 320, height: 640 } },
          children
        )
      ),
    SafeAreaConsumer: ({ children }: { children: (insets: { top: number; right: number; bottom: number; left: number }) => React.ReactNode }) =>
      children({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaView: View,
    initialWindowMetrics: {
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      frame: { x: 0, y: 0, width: 320, height: 640 }
    },
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 320, height: 640 })
  };
});
