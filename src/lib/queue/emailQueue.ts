import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";

declare global {
  // eslint-disable-next-line no-var
  var emailBullQueue: Queue | undefined;
}

export function getEmailQueue(): Queue {
  if (!global.emailBullQueue) {
    global.emailBullQueue = new Queue("email-sending-queue", {
      connection: getRedisConnection() as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000, // Retry after 5s, 10s, 20s...
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }
  return global.emailBullQueue;
}

export default getEmailQueue;
