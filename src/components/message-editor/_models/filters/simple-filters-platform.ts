export enum SimpleFiltersPlatform {
  ALL = "all",
  IOS = "ios",
  ANDROID = "android",
}

export function displayTextForSimpleFiltersPlatform(
  platform: SimpleFiltersPlatform,
) {
  switch (platform) {
    case SimpleFiltersPlatform.ALL:
      return "All Platforms";
    case SimpleFiltersPlatform.IOS:
      return "Only iOS";
    case SimpleFiltersPlatform.ANDROID:
      return "Only Android";
  }
}
