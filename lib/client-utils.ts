export function decodePassphrase(base64String: string) {
  return decodeURIComponent(base64String);
}

export function isLowPowerDevice() {
  return navigator.hardwareConcurrency < 6;
}

export function isMeetStaging() {
  return new URL(location.origin).host === 'meet.staging.livekit.io';
}
