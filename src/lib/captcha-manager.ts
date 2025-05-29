import axios from 'axios';
import type { Page } from 'puppeteer';

export interface CaptchaProvider {
  name: string;
  solveCaptcha(options: CaptchaSolveOptions): Promise<string>;
}

export interface CaptchaSolveOptions {
  type: 'recaptcha' | 'hcaptcha' | 'image';
  siteKey?: string;
  pageUrl?: string;
  imageBase64?: string;
  timeout?: number;
}

export class TwoCaptchaProvider implements CaptchaProvider {
  name = '2captcha';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://2captcha.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async solveCaptcha(options: CaptchaSolveOptions): Promise<string> {
    if (options.type === 'recaptcha' && options.siteKey && options.pageUrl) {
      return await this.solveRecaptcha(options.siteKey, options.pageUrl, options.timeout ?? 120000);
    }
    throw new Error(`2captcha does not support captcha type: ${options.type}`);
  }

  private async solveRecaptcha(siteKey: string, pageUrl: string, timeout = 120000): Promise<string> {
    // Submit captcha
    const submitResponse = await axios.post(`${this.baseUrl}/in.php`, {
      key: this.apiKey,
      method: 'userrecaptcha',
      googlekey: siteKey,
      pageurl: pageUrl,
      json: 1,
    });

    if (submitResponse.data.status !== 1) {
      throw new Error(`Failed to submit captcha: ${submitResponse.data.error_text}`);
    }

    const captchaId = submitResponse.data.request;
    const startTime = Date.now();

    // Poll for result
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const resultResponse = await axios.get(`${this.baseUrl}/res.php`, {
        params: {
          key: this.apiKey,
          action: 'get',
          id: captchaId,
          json: 1,
        },
      });

      if (resultResponse.data.status === 1) {
        return resultResponse.data.request;
      }

      if (resultResponse.data.error_text && resultResponse.data.error_text !== 'CAPCHA_NOT_READY') {
        throw new Error(`Captcha solving failed: ${resultResponse.data.error_text}`);
      }
    }

    throw new Error('Captcha solving timeout');
  }
}

export class AntiCaptchaProvider implements CaptchaProvider {
  name = 'anticaptcha';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anti-captcha.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async solveCaptcha(options: CaptchaSolveOptions): Promise<string> {
    if (options.type === 'recaptcha' && options.siteKey && options.pageUrl) {
      return await this.solveRecaptcha(options.siteKey, options.pageUrl, options.timeout ?? 120000);
    }
    if (options.type === 'hcaptcha' && options.siteKey && options.pageUrl) {
      // AntiCaptcha supports hCaptcha
      throw new Error('hCaptcha not implemented yet for AntiCaptcha');
    }
    throw new Error(`AntiCaptcha does not support captcha type: ${options.type}`);
  }

  private async solveRecaptcha(siteKey: string, pageUrl: string, timeout = 120000): Promise<string> {
    // Create task
    const createTaskResponse = await axios.post(`${this.baseUrl}/createTask`, {
      clientKey: this.apiKey,
      task: {
        type: 'NoCaptchaTaskProxyless',
        websiteURL: pageUrl,
        websiteKey: siteKey,
      },
    });

    if (createTaskResponse.data.errorId !== 0) {
      throw new Error(`Failed to create task: ${createTaskResponse.data.errorDescription}`);
    }

    const taskId = createTaskResponse.data.taskId;
    const startTime = Date.now();

    // Poll for result
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

      const resultResponse = await axios.post(`${this.baseUrl}/getTaskResult`, {
        clientKey: this.apiKey,
        taskId: taskId,
      });

      if (resultResponse.data.status === 'ready') {
        return resultResponse.data.solution.gRecaptchaResponse;
      }

      if (resultResponse.data.errorId !== 0) {
        throw new Error(`Task failed: ${resultResponse.data.errorDescription}`);
      }
    }

    throw new Error('Captcha solving timeout');
  }
}

export class CapSolverProvider implements CaptchaProvider {
  name = 'capsolver';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.capsolver.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async solveCaptcha(options: CaptchaSolveOptions): Promise<string> {
    if (options.type === 'recaptcha' && options.siteKey && options.pageUrl) {
      return await this.solveRecaptcha(options.siteKey, options.pageUrl, options.timeout ?? 300000); // CapSolver has longer timeout
    }
    if (options.type === 'hcaptcha' && options.siteKey && options.pageUrl) {
      throw new Error('hCaptcha not implemented yet for CapSolver');
    }
    if (options.type === 'image' && options.imageBase64) {
      throw new Error('Image captcha not implemented yet for CapSolver');
    }
    throw new Error(`CapSolver does not support captcha type: ${options.type}`);
  }

  private async solveRecaptcha(siteKey: string, pageUrl: string, timeout = 120000): Promise<string> {
    // Create task
    const createTaskResponse = await axios.post(`${this.baseUrl}/createTask`, {
      clientKey: this.apiKey,
      task: {
        type: 'ReCaptchaV2TaskProxyLess',
        websiteURL: pageUrl,
        websiteKey: siteKey,
      },
    });

    if (createTaskResponse.data.errorId !== 0) {
      throw new Error(`Failed to create task: ${createTaskResponse.data.errorDescription}`);
    }

    const taskId = createTaskResponse.data.taskId;
    const startTime = Date.now();

    // Poll for result
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

      const resultResponse = await axios.post(`${this.baseUrl}/getTaskResult`, {
        clientKey: this.apiKey,
        taskId: taskId,
      });

      if (resultResponse.data.status === 'ready') {
        return resultResponse.data.solution.gRecaptchaResponse;
      }

      if (resultResponse.data.errorId !== 0) {
        throw new Error(`Task failed: ${resultResponse.data.errorDescription}`);
      }
    }

    throw new Error('Captcha solving timeout');
  }
}

export class CaptchaManager {
  private readonly providers: Map<string, CaptchaProvider> = new Map();
  private readonly fallbackOrder: string[] = [];

  addProvider(provider: CaptchaProvider): void {
    this.providers.set(provider.name, provider);
    this.fallbackOrder.push(provider.name);
  }

  async solveCaptcha(options: CaptchaSolveOptions): Promise<string> {
    let lastError: Error | null = null;

    for (const providerName of this.fallbackOrder) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        console.log(`Attempting to solve captcha with ${providerName}`);
        const result = await provider.solveCaptcha(options);
        console.log(`Successfully solved captcha with ${providerName}`);
        return result;
      } catch (error) {
        console.warn(`Failed to solve captcha with ${providerName}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError || new Error('No captcha providers available');
  }

  async detectCaptcha(page: Page): Promise<CaptchaSolveOptions | null> {
    try {
      // Check for reCAPTCHA
      const recaptchaElement = await page.$('.g-recaptcha, [data-sitekey]');
      if (recaptchaElement) {
        const siteKey = await page.evaluate((el: Element) => {
          return el.getAttribute('data-sitekey') ?? 
                 document.querySelector('[data-sitekey]')?.getAttribute('data-sitekey');
        }, recaptchaElement);

        if (siteKey) {
          return {
            type: 'recaptcha',
            siteKey,
            pageUrl: page.url(),
          };
        }
      }

      // Check for hCaptcha
      const hcaptchaElement = await page.$('.h-captcha, [data-sitekey*="hcaptcha"]');
      if (hcaptchaElement) {
        const siteKey = await page.evaluate((el: Element) => {
          return el.getAttribute('data-sitekey');
        }, hcaptchaElement);

        if (siteKey) {
          return {
            type: 'hcaptcha',
            siteKey,
            pageUrl: page.url(),
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to detect captcha:', error);
      return null;
    }
  }
}
