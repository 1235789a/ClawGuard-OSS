#!/usr/bin/env python3
"""
ClawGuard OSS v2 - 开源引流版反向代理核心（安全增强版）
极简 | 炫酷 | 零配置 | 高性能 | 安全

🎯 这是 ClawGuard 的开源版本，提供基础的 API 转发功能
💎 想要硬件级安全、数据库审计、PII 脱敏？升级到 PRO 版！
"""

import os
import sys
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict
from collections import defaultdict

import httpx
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse
from colorama import Fore, Back, Style, init

# 初始化 colorama（Windows 兼容）
init(autoreset=True)

# ============================================================================
# 🛡️ 安全监控器 - SecurityMonitor
# ============================================================================

class SecurityMonitor:
    """OSS 版安全监控器（内存版）"""
    
    def __init__(self):
        # 失败请求计数器 {ip: [(timestamp, status_code), ...]}
        self.failed_requests: Dict[str, list] = defaultdict(list)
        # 告警去重 {ip: last_alert_time}
        self.last_alert: Dict[str, datetime] = {}
        # 告警阈值
        self.alert_threshold = 10  # 5分钟内失败10次触发告警
        self.alert_window = timedelta(minutes=5)
        self.alert_cooldown = timedelta(minutes=10)  # 告警冷却期
    
    def mask_api_key(self, auth_header: str) -> str:
        """
        打码 API 密钥
        Bearer sk-1234567890abcdef -> Bearer sk-1234****cdef
        """
        if not auth_header:
            return auth_header
        
        # 检测 Bearer token
        if auth_header.startswith("Bearer sk-"):
            key = auth_header[10:]  # 去掉 "Bearer sk-"
            if len(key) > 8:
                masked = f"Bearer sk-{key[:4]}****{key[-4:]}"
                return masked
        
        return auth_header
    
    def record_request(self, ip: str, status_code: int):
        """记录请求并检测异常"""
        now = datetime.now()
        
        # 只记录失败请求（4xx, 5xx）
        if status_code >= 400:
            self.failed_requests[ip].append((now, status_code))
            
            # 清理过期记录（超过5分钟）
            self.failed_requests[ip] = [
                (ts, code) for ts, code in self.failed_requests[ip]
                if now - ts < self.alert_window
            ]
            
            # 检查是否需要告警
            self._check_alert(ip, status_code)
    
    def _check_alert(self, ip: str, status_code: int):
        """检查是否需要触发告警"""
        now = datetime.now()
        
        # 检查冷却期
        if ip in self.last_alert:
            if now - self.last_alert[ip] < self.alert_cooldown:
                return  # 还在冷却期，不重复告警
        
        # 统计失败次数
        failed_count = len(self.failed_requests[ip])
        
        if failed_count >= self.alert_threshold:
            self._print_alert(ip, failed_count, status_code)
            self.last_alert[ip] = now
            # 清空该 IP 的失败记录，避免重复告警
            self.failed_requests[ip] = []
    
    def _print_alert(self, ip: str, count: int, last_status: int):
        """打印安全告警"""
        print(f"\n{Back.RED}{Fore.WHITE}{Style.BRIGHT}{'!' * 80}{Style.RESET_ALL}")
        print(f"{Fore.RED}{Style.BRIGHT}🚨 安全告警：检测到异常流量模式{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}   来源 IP: {Fore.WHITE}{ip}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}   失败次数: {Fore.WHITE}{count} 次（5分钟内）{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}   最后状态: {Fore.WHITE}{last_status}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}   可能原因: {Fore.WHITE}API 密钥失效、被盗用或恶意扫描{Style.RESET_ALL}")
        print(f"{Fore.CYAN}   💎 PRO 版支持：邮件告警、自动封禁、智能检测{Style.RESET_ALL}")
        print(f"{Back.RED}{Fore.WHITE}{Style.BRIGHT}{'!' * 80}{Style.RESET_ALL}\n")


# 全局安全监控器实例
security_monitor = SecurityMonitor()

# ============================================================================
# 🎨 视觉震撼层 - ASCII Logo & 商业引流横幅
# ============================================================================

LOGO = f"""
{Fore.CYAN}{Style.BRIGHT}
   ██████╗██╗      █████╗ ██╗    ██╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ 
  ██╔════╝██║     ██╔══██╗██║    ██║██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
  ██║     ██║     ███████║██║ █╗ ██║██║  ███╗██║   ██║███████║██████╔╝██║  ██║
  ██║     ██║     ██╔══██║██║███╗██║██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
  ╚██████╗███████╗██║  ██║╚███╔███╔╝╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
{Fore.MAGENTA}                              OSS v2 - Security Enhanced Edition
{Style.RESET_ALL}"""

UPGRADE_BANNER = f"""
{Back.YELLOW}{Fore.BLACK}{Style.BRIGHT}{'═' * 80}{Style.RESET_ALL}
{Fore.YELLOW}{Style.BRIGHT}✨ Upgrade to ClawGuard PRO for Hardware-level Security, DB Logging & PII Scrubbing!{Style.RESET_ALL}
{Fore.CYAN}   💎 仅需 ¥99 ($14) | 🔐 私钥物理隔离 | 📊 SQLite 审计 | 🛡️ PII 自动脱敏{Style.RESET_ALL}
{Fore.GREEN}   🚀 立即购买: https://clawguard.dev/pro{Style.RESET_ALL}
{Back.YELLOW}{Fore.BLACK}{Style.BRIGHT}{'═' * 80}{Style.RESET_ALL}
"""

# ============================================================================
# 🛠️ 核心配置
# ============================================================================

# 从环境变量读取目标主机（不带 /v1 后缀）
TARGET_HOST = os.getenv("TARGET_HOST", "https://api.openai.com")
PORT = int(os.getenv("PORT", "8000"))

# 验证配置
if not TARGET_HOST:
    print(f"{Fore.RED}❌ 错误: 请设置环境变量 TARGET_HOST{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}示例: export TARGET_HOST=https://api.openai.com{Style.RESET_ALL}")
    sys.exit(1)

# 创建 FastAPI 应用
app = FastAPI(
    title="ClawGuard OSS v2",
    description="开源 AI 安全网关 - 极简反向代理（安全增强版）",
    version="2.0.0",
    docs_url=None,  # 禁用文档（保持极简）
    redoc_url=None
)

# ============================================================================
# 🎯 核心功能 - 反向代理引擎
# ============================================================================

def print_traffic_log(
    method: str,
    path: str,
    client_ip: str,
    status_code: int,
    duration_ms: float,
    auth_header: Optional[str] = None
):
    """打印彩色极客风格的流量日志（带密钥打码）"""
    # 状态指示器
    if 200 <= status_code < 300:
        status_icon = f"{Fore.GREEN}🟢{Style.RESET_ALL}"
        status_text = f"{Fore.GREEN}{status_code}{Style.RESET_ALL}"
    elif 400 <= status_code < 500:
        status_icon = f"{Fore.YELLOW}🟡{Style.RESET_ALL}"
        status_text = f"{Fore.YELLOW}{status_code}{Style.RESET_ALL}"
    else:
        status_icon = f"{Fore.RED}🔴{Style.RESET_ALL}"
        status_text = f"{Fore.RED}{status_code}{Style.RESET_ALL}"
    
    # 时间戳
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    # 打码 API 密钥
    masked_auth = ""
    if auth_header:
        masked = security_monitor.mask_api_key(auth_header)
        if masked != auth_header:
            masked_auth = f" | 🔐 {Fore.CYAN}{masked}{Style.RESET_ALL}"
    
    # 打印单行日志
    print(
        f"{Fore.CYAN}[{timestamp}]{Style.RESET_ALL} "
        f"{Fore.MAGENTA}⚡ 流量劫持{Style.RESET_ALL} | "
        f"{Fore.YELLOW}{client_ip}{Style.RESET_ALL} → "
        f"{Fore.CYAN}{method}{Style.RESET_ALL} "
        f"{Fore.WHITE}{path}{Style.RESET_ALL} | "
        f"状态: {status_icon} {status_text} | "
        f"{Fore.GREEN}{duration_ms:.0f}ms{Style.RESET_ALL}"
        f"{masked_auth}"
    )


def clean_headers(headers: dict) -> dict:
    """清洗请求头：剔除 Host 和 Content-Length，保留 Authorization"""
    cleaned = {}
    skip_headers = {"host", "content-length"}
    
    for key, value in headers.items():
        if key.lower() not in skip_headers:
            cleaned[key] = value
    
    return cleaned


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def reverse_proxy(request: Request, path: str):
    """
    核心反向代理处理器（安全增强版）
    - 捕获所有路径和方法
    - 流式透传请求和响应
    - 自动清洗请求头
    - API 密钥自动打码
    - 异常流量检测
    """
    start_time = asyncio.get_event_loop().time()
    
    # 获取客户端 IP
    client_ip = request.client.host if request.client else "unknown"
    
    # 构建目标 URL（精准拼接）
    target_url = f"{TARGET_HOST}/{path}"
    if request.url.query:
        target_url += f"?{request.url.query}"
    
    # 清洗请求头
    headers = clean_headers(dict(request.headers))
    
    # 获取 Authorization 头（用于日志打码）
    auth_header = request.headers.get("authorization", "")
    
    # 读取请求体
    body = await request.body()
    
    try:
        # 使用上下文管理器确保连接安全释放
        async with httpx.AsyncClient(timeout=300.0) as client:
            # 流式请求
            async with client.stream(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                follow_redirects=True
            ) as response:
                # 记录状态码
                status_code = response.status_code
                
                # 构建响应头
                response_headers = dict(response.headers)
                # 移除可能导致问题的头
                response_headers.pop("content-encoding", None)
                response_headers.pop("transfer-encoding", None)
                
                # 流式生成器
                async def generate():
                    async for chunk in response.aiter_bytes():
                        yield chunk
                
                # 计算耗时并打印日志
                duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000
                print_traffic_log(
                    method=request.method,
                    path=f"/{path}",
                    client_ip=client_ip,
                    status_code=status_code,
                    duration_ms=duration_ms,
                    auth_header=auth_header
                )
                
                # 记录请求到安全监控器
                security_monitor.record_request(client_ip, status_code)
                
                # 返回流式响应
                return StreamingResponse(
                    generate(),
                    status_code=status_code,
                    headers=response_headers,
                    media_type=response.headers.get("content-type")
                )
    
    except httpx.RequestError as e:
        # 网络错误处理
        duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        status_code = 502
        print_traffic_log(
            method=request.method,
            path=f"/{path}",
            client_ip=client_ip,
            status_code=status_code,
            duration_ms=duration_ms,
            auth_header=auth_header
        )
        security_monitor.record_request(client_ip, status_code)
        return Response(
            content=f"Bad Gateway: {str(e)}",
            status_code=status_code,
            media_type="text/plain"
        )
    
    except Exception as e:
        # 其他错误处理
        duration_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        status_code = 500
        print_traffic_log(
            method=request.method,
            path=f"/{path}",
            client_ip=client_ip,
            status_code=status_code,
            duration_ms=duration_ms,
            auth_header=auth_header
        )
        security_monitor.record_request(client_ip, status_code)
        return Response(
            content=f"Internal Server Error: {str(e)}",
            status_code=status_code,
            media_type="text/plain"
        )


# ============================================================================
# 🚀 启动入口
# ============================================================================

def print_startup_banner():
    """打印启动横幅（带安全提示）"""
    print(LOGO)
    print(UPGRADE_BANNER)
    
    # 安全功能说明
    print(f"\n{Fore.GREEN}✅ ClawGuard OSS v2 已启动（安全增强版）{Style.RESET_ALL}")
    print(f"{Fore.CYAN}📡 监听端口: {Fore.WHITE}{PORT}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}🎯 转发目标: {Fore.WHITE}{TARGET_HOST}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}⚡ 模式: {Fore.YELLOW}零配置透明转发{Style.RESET_ALL}")
    
    # 安全功能列表
    print(f"\n{Fore.MAGENTA}🛡️  安全功能（OSS 版）：{Style.RESET_ALL}")
    print(f"{Fore.GREEN}   ✓{Style.RESET_ALL} API 密钥自动打码保护")
    print(f"{Fore.GREEN}   ✓{Style.RESET_ALL} 异常流量实时告警（5分钟/10次失败）")
    print(f"{Fore.GREEN}   ✓{Style.RESET_ALL} 请求头自动清洗")
    
    # HTTPS 安全提醒
    if not TARGET_HOST.startswith("https://"):
        print(f"\n{Back.RED}{Fore.WHITE}{Style.BRIGHT} ⚠️  安全警告 {Style.RESET_ALL}")
        print(f"{Fore.YELLOW}   目标主机使用 HTTP 协议，生产环境请使用 HTTPS{Style.RESET_ALL}")
        print(f"{Fore.CYAN}   💎 PRO 版内置 HTTPS 和自动证书管理{Style.RESET_ALL}")
    
    # 密钥轮换提醒
    print(f"\n{Fore.YELLOW}💡 安全提示：建议每 30 天轮换一次 API 密钥{Style.RESET_ALL}")
    print(f"{Fore.CYAN}   💎 PRO 版支持自动轮换和多密钥管理{Style.RESET_ALL}")
    
    print(f"\n{Fore.MAGENTA}{'─' * 80}{Style.RESET_ALL}\n")


if __name__ == "__main__":
    # 打印启动横幅
    print_startup_banner()
    
    # 启动服务器
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="warning",  # 只显示警告和错误，保持终端清爽
        access_log=False  # 禁用默认访问日志（我们有自定义的彩色日志）
    )
