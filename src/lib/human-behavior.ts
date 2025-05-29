import { Page } from 'puppeteer-core';

export class HumanBehaviorSimulator {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Human-like mouse movement
  async humanClick(selector: string, options: { delay?: number; offset?: { x: number; y: number } } = {}): Promise<void> {
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Element has no bounding box: ${selector}`);
    }

    // Calculate click position with some randomness
    const x = box.x + box.width / 2 + (options.offset?.x ?? this.randomOffset());
    const y = box.y + box.height / 2 + (options.offset?.y ?? this.randomOffset());

    // Move mouse in a human-like curve
    await this.humanMouseMove(x, y);
    
    // Add slight delay before click
    await this.randomDelay(100, 300);
    
    // Click with random duration
    await this.page.mouse.down();
    await this.randomDelay(50, 150);
    await this.page.mouse.up();

    if (options.delay) {
      await this.randomDelay(options.delay * 0.8, options.delay * 1.2);
    }
  }

  // Human-like mouse movement with curves
  async humanMouseMove(targetX: number, targetY: number): Promise<void> {
    const currentMouse = await this.page.evaluate(() => {
      return { x: window.screenX || 0, y: window.screenY || 0 };
    });

    const startX = currentMouse.x;
    const startY = currentMouse.y;
    
    const steps = Math.floor(Math.random() * 20) + 10; // 10-30 steps
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Use bezier curve for natural movement
      const x = this.bezierPoint(startX, startX + (targetX - startX) * 0.3, targetX - (targetX - startX) * 0.3, targetX, progress);
      const y = this.bezierPoint(startY, startY + (targetY - startY) * 0.3, targetY - (targetY - startY) * 0.3, targetY, progress);
      
      await this.page.mouse.move(x, y);
      await this.randomDelay(10, 30);
    }
  }

  // Human-like typing
  async humanType(selector: string, text: string, options: { delay?: number; clearFirst?: boolean } = {}): Promise<void> {
    if (options.clearFirst) {
      await this.page.click(selector);
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await this.randomDelay(50, 100);
    }

    const chars = text.split('');
    
    for (const char of chars) {
      // Random typing speed between 50-150ms per character
      const delay = this.randomBetween(50, 150);
      
      // Simulate occasional typos and corrections (5% chance)
      if (Math.random() < 0.05 && /[a-zA-Z]/.exec(char)) {
        // Type wrong character
        const wrongChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
        await this.page.keyboard.type(wrongChar, { delay: delay });
        await this.randomDelay(100, 300);
        
        // Backspace and correct
        await this.page.keyboard.press('Backspace');
        await this.randomDelay(50, 150);
        await this.page.keyboard.type(char, { delay: delay });
      } else {
        await this.page.keyboard.type(char, { delay: delay });
      }
      
      // Occasional longer pauses (thinking)
      if (Math.random() < 0.1) {
        await this.randomDelay(200, 500);
      }
    }

    if (options.delay) {
      await this.randomDelay(options.delay * 0.8, options.delay * 1.2);
    }
  }

  // Human-like scrolling
  async humanScroll(options: { direction?: 'up' | 'down'; distance?: number; speed?: 'slow' | 'medium' | 'fast' } = {}): Promise<void> {
    const direction = options.direction ?? 'down';
    const distance = options.distance ?? this.randomBetween(300, 800);
    const speed = options.speed ?? 'medium';
    
    const speedMap = {
      slow: { steps: 20, delay: 100 },
      medium: { steps: 15, delay: 50 },
      fast: { steps: 10, delay: 20 },
    };
    
    const config = speedMap[speed];
    const stepSize = distance / config.steps;
    
    for (let i = 0; i < config.steps; i++) {
      const scrollDelta = direction === 'down' ? stepSize : -stepSize;
      
      await this.page.mouse.wheel({ deltaY: scrollDelta });
      await this.randomDelay(config.delay * 0.8, config.delay * 1.2);
      
      // Occasional pause while scrolling
      if (Math.random() < 0.2) {
        await this.randomDelay(200, 500);
      }
    }
  }

  // Simulate reading behavior
  async simulateReading(duration: number = 2000): Promise<void> {
    // Scroll down slowly as if reading
    const scrollSteps = Math.floor(duration / 500);
    const scrollDistance = 100;
    
    for (let i = 0; i < scrollSteps; i++) {
      await this.randomDelay(400, 600);
      await this.page.mouse.wheel({ deltaY: scrollDistance });
      
      // Occasional pause for "interesting content"
      if (Math.random() < 0.3) {
        await this.randomDelay(800, 1500);
      }
    }
  }

  // Random page interactions to appear human
  async randomInteractions(): Promise<void> {
    const actions = [
      () => this.humanScroll({ direction: 'down', distance: this.randomBetween(200, 400) }),
      () => this.randomDelay(1000, 3000), // Just wait/read
      () => this.moveMouseRandomly(),
      () => this.simulateReading(this.randomBetween(1000, 3000)),
    ];

    const numActions = this.randomBetween(1, 3);
    
    for (let i = 0; i < numActions; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      await action();
    }
  }

  // Move mouse to random position on page
  async moveMouseRandomly(): Promise<void> {
    const viewport = this.page.viewport();
    if (!viewport) return;

    const x = this.randomBetween(100, viewport.width - 100);
    const y = this.randomBetween(100, viewport.height - 100);
    
    await this.humanMouseMove(x, y);
  }

  // Wait for random human-like delay
  async randomDelay(min: number = 500, max: number = 1500): Promise<void> {
    const delay = this.randomBetween(min, max);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Helper methods
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomOffset(): number {
    return Math.floor(Math.random() * 20) - 10; // -10 to +10 pixels
  }

  private bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const oneMinusT = 1 - t;
    return (
      oneMinusT * oneMinusT * oneMinusT * p0 +
      3 * oneMinusT * oneMinusT * t * p1 +
      3 * oneMinusT * t * t * p2 +
      t * t * t * p3
    );
  }

  // Simulate realistic browser behavior
  async setupHumanBehavior(): Promise<void> {
    // Add random mouse movements during page load
    await this.page.evaluateOnNewDocument(() => {
      // Override Date.now to add slight randomness
      const originalDateNow = Date.now;
      Date.now = function() {
        return originalDateNow() + Math.floor(Math.random() * 10);
      };

      // Add slight randomness to Math.random
      const originalRandom = Math.random;
      Math.random = function() {
        return originalRandom() * (1 + (originalRandom() - 0.5) * 0.0001);
      };

      // Simulate real browser behavior
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Add realistic screen properties
      Object.defineProperty(screen, 'availTop', {
        get: () => 23, // Common macOS value
      });

      Object.defineProperty(screen, 'availLeft', {
        get: () => 0,
      });

      // Add realistic permissions
      const originalQuery = navigator.permissions?.query;
      if (originalQuery && typeof originalQuery === 'function') {
        navigator.permissions.query = function(parameters: PermissionDescriptor) {
          // Use the parameters to provide more realistic behavior
          const state = parameters.name === 'geolocation' ? 'denied' : 'granted';
          return Promise.resolve({
            state,
            onchange: null,
          } as PermissionStatus);
        };
      }
    });
  }

  // Simulate human-like form filling
  async fillFormHumanly(formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      try {
        await this.randomDelay(300, 800); // Pause before each field
        await this.humanClick(selector);
        await this.randomDelay(200, 400);
        await this.humanType(selector, value, { clearFirst: true });
      } catch (error) {
        console.warn(`Failed to fill field ${selector}:`, error);
      }
    }
  }
}
