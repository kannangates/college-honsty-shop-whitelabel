export {};

declare global {
  /**
   * Minimal Deno global used by our edge functions.
   * Expand as needed if additional APIs are referenced.
   */
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
    serve(handler: (req: Request) => Response | Promise<Response>): void;
  };
}

