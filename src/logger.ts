import { Logger } from "koishi";

/**
 * 统一的 logger 实例
 * 所有模块都应该使用这个 logger 以避免日志混乱
 */
export const logger = new Logger("x-watcher");
