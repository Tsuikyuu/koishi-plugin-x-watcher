import { Tweet } from "rettiwt-api";
import { formatTweetTime } from "./utils";

/**
 * 推文消息格式化选项
 */
export interface TweetMessageOptions {
  /** 推文对象 */
  tweet: Tweet;
  /** 推特用户全名 */
  fullname: string;
  /** 推特用户名 */
  username: string;
}

/**
 * 格式化推文消息
 * @param options 消息格式化选项
 * @returns 格式化后的消息字符串
 */
export function formatTweetMessage(options: TweetMessageOptions): string {
  const { tweet, fullname, username } = options;

  // 构建推文URL
  const tweetUrl = `https://twitter.com/${username}/status/${tweet.id}`;

  // 获取并格式化时间
  const tweetTime = formatTweetTime(tweet);
  const timeStr = tweetTime ? `\n发布时间: ${tweetTime}` : "";

  // 构建完整消息
  const message = `${fullname} (@${username}) 发布了新推文:${timeStr}\n\n${
    tweet.fullText || ""
  }\n\n${tweetUrl}`;

  return message;
}

/**
 * 格式化订阅列表消息
 * @param watchers 订阅列表
 * @returns 格式化后的订阅列表消息
 */
export function formatWatcherListMessage(watchers: any[]): string {
  if (watchers.length === 0) {
    return "当前没有订阅任何推特用户";
  }

  const tableHeader = "| 订阅 | 状态 | 过滤条件 |\n|------|------|----------|";
  const tableRows = watchers
    .map((watcher) => {
      const status = watcher.active ? "订阅中" : "已取消";
      const filter = watcher.filter_regexp || "无";
      return `| ${watcher.twitter_username} | ${status} | ${filter} |`;
    })
    .join("\n");

  return `当前订阅的推特用户：\n${tableHeader}\n${tableRows}`;
}
