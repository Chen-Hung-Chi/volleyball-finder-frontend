const getChannelId = () => {
  const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID
  if (!channelId) return ''
  // 確保 Channel ID 是一個有效的數字
  const numericChannelId = parseInt(channelId, 10)
  return isNaN(numericChannelId) ? '' : channelId
}

export const lineConfig = {
  channelId: getChannelId(),
  channelSecret: process.env.NEXT_PUBLIC_LINE_CHANNEL_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || 'http://localhost:8080/api/line/callback',
  isTestMode: process.env.NEXT_PUBLIC_TEST_MODE === 'true'
} 