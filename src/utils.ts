import { getRettiwt } from "./api-client";
import { logger } from "./logger";

/**
 * 从 twitter_username 获取 twitter_fullname 和 twitter_id
 * @param {string} twitter_username - 推特用户名
 * @param {string} auth_key - 推特API密钥
 * @returns {fullname: string, id: string,username: string} 推特用户信息
 */
export async function getTwitterUserInfo(
  twitter_username: string,
  auth_key: string
): Promise<{ fullname: string; id: string; username: string }> {
  try {
    const rettiwt = getRettiwt(auth_key);
    const user = await rettiwt.user.details(twitter_username);
    return { fullname: user.fullName, id: user.id, username: user.userName };
  } catch (error) {
    throw new Error(
      `获取推特用户名失败，请检查推特用户id是否正确，你只需要输入推特用户id，不需要输入@`
    );
  }
}

/**
 * 获取推特用户的最新推文ID
 * @param {string} twitter_id - 推特用户ID
 * @param {string} auth_key - 推特API密钥
 * @returns {string | null} 最新推文ID，如果没有推文则返回null
 */
export async function getLatestTweetId(
  twitter_id: string,
  auth_key: string
): Promise<string | null> {
  try {
    const rettiwt = getRettiwt(auth_key);
    const tweets = await rettiwt.user.timeline(twitter_id, 1);

    if (!tweets || !tweets.list || tweets.list.length === 0) {
      logger.debug(`用户 ${twitter_id} 没有推文`);
      return null;
    }

    const latestTweet = tweets.list[0];
    logger.debug(`获取到用户 ${twitter_id} 的最新推文ID: ${latestTweet.id}`);
    return latestTweet.id;
  } catch (error) {
    logger.error(`获取用户 ${twitter_id} 最新推文ID失败:`, error);
    // 不抛出错误，返回null，让订阅继续进行
    return null;
  }
}

/**
 * 从 Twitter Snowflake ID 中提取时间戳
 * @param snowflakeId Snowflake ID 字符串
 * @returns Date 对象，如果提取失败则返回 null
 */
export function extractTimeFromSnowflake(snowflakeId: string): Date | null {
  try {
    // Twitter Snowflake ID 的时间戳部分
    // Snowflake ID 的前 42 位是时间戳（毫秒，从 2010-11-04 01:42:54 UTC 开始）
    const TWITTER_EPOCH = 1288834974657; // 2010-11-04 01:42:54 UTC
    const id = BigInt(snowflakeId);
    const timestamp = Number(id >> 22n) + TWITTER_EPOCH;
    return new Date(timestamp);
  } catch (error) {
    logger.warn(`从 Snowflake ID 提取时间失败: ${snowflakeId}`, error);
    return null;
  }
}

/**
 * 从推文对象中提取并格式化时间
 * @param tweet 推文对象
 * @returns 格式化后的时间字符串，如果无法获取时间则返回 null
 */
export function formatTweetTime(tweet: any): string | null {
  let tweetDate: Date | null = null;

  try {
    // 尝试不同的时间字段
    if (tweet.created_at) {
      tweetDate = new Date(tweet.created_at);
    } else if (tweet.createdAt) {
      tweetDate = new Date(tweet.createdAt);
    } else if (tweet.timestamp) {
      tweetDate = new Date(tweet.timestamp);
    } else if (tweet.id) {
      // 从 Snowflake ID 提取时间作为备选
      tweetDate = extractTimeFromSnowflake(tweet.id);
    }

    if (tweetDate && !isNaN(tweetDate.getTime())) {
      return tweetDate.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  } catch (error) {
    logger.warn(`格式化推文时间失败: ${tweet.id}`, error);
  }

  return null;
}
