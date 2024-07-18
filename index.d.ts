import type { CallbackComponent } from "systemic";
import type { ErrorRequestHandler, Express, RequestHandler } from "express";

export type AppConfig = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  settings: Record<string, any>;
};

export type ServerConfig = {
  port: number;
  host?: string;
  shutdown?: { delay?: string };
};

type MiddlewareOptions = {
  notFound?: RequestHandler;
  error?: ErrorRequestHandler;
};

export type MiddleWareConfig = {
  showErrorDetail?: boolean;
};

/**
 * Systemic component that creates and configures an Express app
 * @param options optionally a function that creates a basic Express app can be passed into the component
 */
export function app(options?: { express?: () => Express }): CallbackComponent<
  Express,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  { config?: AppConfig; logger?: any }
>;

/**
 * Starts the Express server
 */
export function server(): CallbackComponent<
  void,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  { config: ServerConfig; app: Express; logger?: any }
>;

/**
 * Adds default notFound and error middleware to the app
 * @param options Custom notfound and error middleware can be passed in. If omitted default middleware will be used.
 */
export function defaultMiddleware(
  options?: MiddlewareOptions,
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): CallbackComponent<void, { config?: MiddleWareConfig; app: Express; logger?: any }>;
