export const UPDATE_CONFIG = {
  AUTO_CHECK: true,
  CHECK_INTERVAL: 12 * 60 * 60 * 1000,
  GITHUB_RAW_URL: '',
  getDownloadUrl(version: string): string {
    return '';
  },
  SHOW_RELEASE_NOTES: true,
  ALLOW_SKIP_VERSION: true,
  DOWNLOAD_TIMEOUT: 10 * 60 * 1000,
  AUTO_DOWNLOAD_ON_WIFI: false,
  NOTIFICATION: {
    ENABLED: true,
    TITLE: "云影TV 更新",
    DOWNLOADING_TEXT: "正在下载新版本...",
    DOWNLOAD_COMPLETE_TEXT: "下载完成，点击安装",
  },
};
