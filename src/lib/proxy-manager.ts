import axios from 'axios';

interface ScraperAPIRequestOptions {
  country?: string;
  premium?: boolean;
  session?: number;
  timeout?: number;
}

export interface ProxyProvider {
  name: string;
  getProxy(): Promise<ProxyConfig>;
  rotateProxy?(): Promise<ProxyConfig>;
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks5';
}

export class ScraperAPIProvider implements ProxyProvider {
  name = 'scraperapi';
  private readonly apiKey: string;
  private readonly endpoint = 'http://api.scraperapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getProxy(): Promise<ProxyConfig> {
    // ScraperAPI works differently - it's a proxy endpoint with API key
    return {
      host: 'proxy-server.scraperapi.com',
      port: 8001,
      username: 'scraperapi',
      password: this.apiKey,
      protocol: 'http',
    };
  }

  // For ScraperAPI, we can request through their endpoint directly
  async makeRequest(url: string, options: ScraperAPIRequestOptions = {}): Promise<string> {
    const response = await axios.get(`${this.endpoint}`, {
      params: {
        api_key: this.apiKey,
        url: url,
        render: true, // Render JavaScript
        country_code: options.country ?? 'US',
        premium: options.premium ?? false,
        session_number: options.session ?? Math.floor(Math.random() * 1000),
      },
      timeout: options.timeout ?? 60000,
    });

    return response.data;
  }
}

export class BrightDataProvider implements ProxyProvider {
  name = 'brightdata';
  private readonly username: string;
  private readonly password: string;
  private readonly endpoint: string;
  private readonly port: number;

  constructor(username: string, password: string, endpoint: string, port: number) {
    this.username = username;
    this.password = password;
    this.endpoint = endpoint;
    this.port = port;
  }

  async getProxy(): Promise<ProxyConfig> {
    return {
      host: this.endpoint,
      port: this.port,
      username: this.username,
      password: this.password,
      protocol: 'http',
    };
  }

  async rotateProxy(): Promise<ProxyConfig> {
    // Bright Data supports session rotation by changing the username
    const sessionId = Math.floor(Math.random() * 10000);
    return {
      host: this.endpoint,
      port: this.port,
      username: `${this.username}-session-${sessionId}`,
      password: this.password,
      protocol: 'http',
    };
  }
}

export class SmartProxyProvider implements ProxyProvider {
  name = 'smartproxy';
  private readonly username: string;
  private readonly password: string;
  private readonly endpoints: string[];
  private readonly ports: number[];
  private currentIndex = 0;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    // SmartProxy endpoint examples
    this.endpoints = [
      'gate.smartproxy.com',
      'gate.dc.smartproxy.com',
    ];
    this.ports = [10000, 10001, 10002, 10003, 10004]; // SmartProxy sticky ports
  }

  async getProxy(): Promise<ProxyConfig> {
    const endpoint = this.endpoints[this.currentIndex % this.endpoints.length];
    const port = this.ports[this.currentIndex % this.ports.length];
    
    return {
      host: endpoint,
      port: port,
      username: this.username,
      password: this.password,
      protocol: 'http',
    };
  }

  async rotateProxy(): Promise<ProxyConfig> {
    this.currentIndex++;
    return this.getProxy();
  }
}

export class ProxyManager {
  private readonly providers: Map<string, ProxyProvider> = new Map();
  private currentProxy: ProxyConfig | null = null;
  private readonly rotationInterval: number;
  private lastRotation: number = 0;
  private readonly failedProxies: Set<string> = new Set();

  constructor(rotationInterval = 300000) { // 5 minutes default
    this.rotationInterval = rotationInterval;
  }

  addProvider(provider: ProxyProvider): void {
    this.providers.set(provider.name, provider);
  }

  async getWorkingProxy(): Promise<ProxyConfig | null> {
    const now = Date.now();
    
    // Check if we need to rotate
    if (!this.currentProxy || (now - this.lastRotation) > this.rotationInterval) {
      await this.rotateProxy();
    }

    return this.currentProxy;
  }

  async rotateProxy(): Promise<void> {
    const providers = Array.from(this.providers.values());
    
    for (const provider of providers) {
      try {
        let proxy: ProxyConfig;
        
        if (provider.rotateProxy) {
          proxy = await provider.rotateProxy();
        } else {
          proxy = await provider.getProxy();
        }

        const proxyKey = `${proxy.host}:${proxy.port}`;
        
        // Skip if this proxy recently failed
        if (this.failedProxies.has(proxyKey)) {
          continue;
        }

        // Test the proxy
        if (await this.testProxy(proxy)) {
          this.currentProxy = proxy;
          this.lastRotation = Date.now();
          console.log(`Rotated to proxy: ${provider.name} - ${proxyKey}`);
          return;
        } else {
          this.failedProxies.add(proxyKey);
          console.warn(`Proxy failed test: ${proxyKey}`);
        }
      } catch (error) {
        console.warn(`Failed to get proxy from ${provider.name}:`, error);
      }
    }

    console.warn('No working proxy found, continuing without proxy');
    this.currentProxy = null;
  }

  private async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const response = await axios.get('http://httpbin.org/ip', {
        proxy: {
          protocol: proxy.protocol,
          host: proxy.host,
          port: proxy.port,
          auth: proxy.username && proxy.password ? {
            username: proxy.username,
            password: proxy.password,
          } : undefined,
        },
        timeout: 10000,
      });

      return response.status === 200;
    } catch (error) {
      console.warn('Proxy test failed:', error);
      return false;
    }
  }

  markProxyAsFailed(proxy: ProxyConfig): void {
    const proxyKey = `${proxy.host}:${proxy.port}`;
    this.failedProxies.add(proxyKey);
    
    // Clear failed proxies after 30 minutes
    setTimeout(() => {
      this.failedProxies.delete(proxyKey);
    }, 30 * 60 * 1000);
  }

  getCurrentProxy(): ProxyConfig | null {
    return this.currentProxy;
  }

  clearFailedProxies(): void {
    this.failedProxies.clear();
  }
}
