// Global test setup (TASK-002: RTL matchers + RR / jsdom polyfills)
process.env.VITE_SUPABASE_URL ??= "https://test.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY ??= "test-anon-key";

import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
