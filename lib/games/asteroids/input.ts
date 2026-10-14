// Keys the game uses. preventDefault is applied to these so the page never scrolls
// and a focused button is not activated by Space.
const GAME_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"]);

export interface KeyState {
  isDown(code: string): boolean;
}

export class Input implements KeyState {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private attached = false;

  private onKeyDown = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    if (!this.keys.has(e.code)) this.justPressed.add(e.code);
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    this.keys.delete(e.code);
  };

  /** Registers the listeners. Safe to call twice. */
  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  /** Removes the listeners and forgets every held key. */
  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.reset();
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  /** True once per physical press; consumed on read. */
  consumePress(code: string): boolean {
    return this.justPressed.delete(code);
  }

  reset(): void {
    this.keys.clear();
    this.justPressed.clear();
  }
}
