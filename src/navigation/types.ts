export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ReportDetail: { id: string };
  CreateReport: undefined;
  AlertDetail: { id: string };
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Reports: undefined;
  Alerts: undefined;
  Settings: undefined;
  Subscription: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}