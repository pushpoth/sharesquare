// Global test setup (TASK-002: RTL matchers + RR / jsdom polyfills)
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
