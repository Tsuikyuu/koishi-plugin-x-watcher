import { Rettiwt } from "rettiwt-api";
import { logger } from "./logger";

// 创建单例 rettiwt 实例
let rettiwt: Rettiwt | null = null;
let currentAuthKey: string | null = null;

/**
 * 获取或创建 Rettiwt API 客户端实例
 * @param auth_key 推特API密钥
 * @returns Rettiwt 实例
 */
export function getRettiwt(auth_key: string): Rettiwt {
  // 如果密钥发生变化，重置实例
  if (currentAuthKey !== auth_key) {
    logger.info("检测到API密钥变化，重置Rettiwt实例");
    rettiwt = null;
    currentAuthKey = auth_key;
  }

  if (!rettiwt) {
    try {
      rettiwt = new Rettiwt({
        apiKey: auth_key,
      });
      logger.info("Rettiwt 实例初始化成功");
    } catch (error) {
      logger.error("Rettiwt 实例初始化失败", error);
      throw error;
    }
  }
  return rettiwt;
}

/**
 * 重置 Rettiwt 实例（用于测试或重新初始化）
 */
export function resetRettiwt(): void {
  rettiwt = null;
  currentAuthKey = null;
  logger.info("Rettiwt 实例已重置");
}

/**
 * 验证API密钥是否有效
 * @param auth_key 推特API密钥
 * @returns 是否有效
 */
export async function validateApiKey(auth_key: string): Promise<boolean> {
  try {
    const testRettiwt = new Rettiwt({
      apiKey: auth_key,
    });
    // 尝试获取一个公开用户的信息来验证API密钥
    await testRettiwt.user.details("twitter");
    return true;
  } catch (error) {
    logger.warn("API密钥验证失败", error);
    return false;
  }
}
