/**
 * @see https://willhains.com/iOS-version-history
 * @see https://developer.apple.com/documentation/ios-ipados-release-notes
 */

export enum SimpleFiltersIosVersion {
  IOS_18_2 = "18.2",
  IOS_18_1 = "18.1",
  IOS_18 = "18",
  IOS_17_7 = "17.7",
  IOS_17_6 = "17.6",
  IOS_17_5 = "17.5",
  IOS_17_4 = "17.4",
  IOS_17_3 = "17.3",
  IOS_17_2 = "17.2",
  IOS_17_1 = "17.1",
  IOS_17_0 = "17",
  IOS_16_6 = "16.6",
  IOS_16_5 = "16.5",
  IOS_16_4 = "16.4",
  IOS_16_3 = "16.3",
  IOS_16_2 = "16.2",
  IOS_16_1 = "16.1",
  IOS_16_0 = "16",
  IOS_15_7 = "15.7",
  IOS_15_6 = "15.6",
  IOS_15_5 = "15.5",
  IOS_15_4 = "15.4",
  IOS_15_3 = "15.3",
  IOS_15_2 = "15.2",
  IOS_15_1 = "15.1",
  IOS_15_0 = "15",
  IOS_14_8 = "14.8",
  IOS_14_7 = "14.7",
  IOS_14_6 = "14.6",
  IOS_14_5 = "14.5",
  IOS_14_4 = "14.4",
  IOS_14_3 = "14.3",
  IOS_14_2 = "14.2",
  IOS_14_1 = "14.1",
  IOS_14_0 = "14",
  IOS_13_7 = "13.7",
  IOS_13_6 = "13.6",
  IOS_13_5 = "13.5",
  IOS_13_4 = "13.4",
  IOS_13_3 = "13.3",
  IOS_13_2 = "13.2",
  IOS_13_1 = "13.1",
  IOS_13_0 = "13",
  IOS_12_4 = "12.4",
  IOS_12_3 = "12.3",
  IOS_12_2 = "12.2",
  IOS_12_1 = "12.1",
  IOS_12_0 = "12",
  IOS_11_4 = "11.4",
  IOS_11_3 = "11.3",
  IOS_11_2 = "11.2",
  IOS_11_1 = "11.1",
  IOS_11_0 = "11",
  IOS_10_3 = "10.3",
  IOS_10_2 = "10.2",
  IOS_10_1 = "10.1",
  IOS_10_0 = "10",
  IOS_9_3 = "9.3",
  IOS_9_2 = "9.2",
  IOS_9_1 = "9.1",
  IOS_9_0 = "9",
  IOS_8_4 = "8.4",
  IOS_8_3 = "8.3",
  IOS_8_2 = "8.2",
  IOS_8_1 = "8.1",
  IOS_8_0 = "8",
}

export function displayTextForIosVersion(
  version: SimpleFiltersIosVersion,
): string {
  return `iOS ${version}`;
}