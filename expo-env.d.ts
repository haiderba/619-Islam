/// <reference types="expo/types" />

declare module 'expo-router' {
  export const Stack: any;
  export const Tabs: any;
  export function useRouter(): any;
  export function useFocusEffect(callback: () => void | (() => void)): void;
  export function usePathname(): string;
  export function useSegments(): string[];
  export function useLocalSearchParams<T = Record<string, string>>(): T;
  export const Link: any;
  export const Slot: any;
  export const Redirect: any;
}
