declare module 'culori' {
  interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h: number;
  }

  interface RgbColor {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
  }

  type Color = OklchColor | RgbColor | { mode: string };

  export function parse(input: string): Color | undefined;
  export function formatCss(color: Color): string;
  export function converter(targetMode: 'rgb'): (color: Color | undefined) => RgbColor | undefined;
  export function converter(targetMode: 'oklch'): (color: Color | undefined) => OklchColor | undefined;
  export function converter(targetMode: string): (color: Color | undefined) => Color | undefined;
  export function clampChroma(color: OklchColor | Record<string, unknown>, mode?: string): OklchColor;
  export function displayable(color: Color | Record<string, unknown>): boolean;
}
