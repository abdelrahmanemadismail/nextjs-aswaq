// app/api/webhooks/messages/route.ts
import { processNewMessageWebhook } from '@/utils/webhook-notification-service'

export async function POST(request: Request) {
  return processNewMessageWebhook(request)
}