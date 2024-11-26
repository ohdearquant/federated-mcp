import { readLines } from "https://deno.land/std/io/mod.ts";
import { edgeProviders, stats } from "./types.ts";
import { displayServerStatus } from "./server-status.ts";

export async function checkEdgeProviders(): Promise<void> {
  console.log('\n\x1b[35m=== Edge Function Provider Status ===\x1b[0m');
  let anyConfigured = false;
  
  for (const [key, provider] of Object.entries(edgeProviders)) {
    const isConfigured = provider.isConfigured();
    console.log(`${provider.name}: ${isConfigured ? '\x1b[32m✓ Configured\x1b[0m' : '\x1b[31m✗ Not Configured\x1b[0m'}`);
    if (isConfigured) anyConfigured = true;
  }
  
  if (!anyConfigured) {
    console.log('\n\x1b[33m! No edge function providers configured');
    console.log('Use option [4] to configure a provider\x1b[0m');
  }
}

export async function configureProvider(): Promise<string | undefined> {
  console.log('\n\x1b[35m=== Configure Edge Function Provider ===\x1b[0m');
  console.log('Available providers:');
  console.log('1. Supabase');
  console.log('2. Cloudflare Workers');
  console.log('3. Fly.io');
  console.log('4. Cancel');

  for await (const line of readLines(Deno.stdin)) {
    const choice = line.trim();
    let provider: string;
    
    switch (choice) {
      case '1':
        provider = 'supabase';
        break;
      case '2':
        provider = 'cloudflare';
        break;
      case '3':
        provider = 'flyio';
        break;
      case '4':
        return undefined;
      default:
        console.log('\x1b[31m✗ Invalid choice\x1b[0m');
        return undefined;
    }

    const config = edgeProviders[provider];
    console.log(`\n\x1b[35mConfiguring ${config.name}\x1b[0m`);

    const envVars: Record<string, string> = {};
    for (const envVar of config.requiredEnvVars) {
      const current = Deno.env.get(envVar.name);
      if (current) {
        console.log(`${envVar.name}: \x1b[32m✓ Already configured\x1b[0m`);
        envVars[envVar.name] = current;
        continue;
      }

      console.log(`\nEnter ${envVar.description} (${envVar.name}):`);
      for await (const value of readLines(Deno.stdin)) {
        if (value.trim()) {
          envVars[envVar.name] = value.trim();
          Deno.env.set(envVar.name, value.trim());
          break;
        }
        console.log('\x1b[31m✗ Value cannot be empty\x1b[0m');
      }
    }

    console.log(`\n\x1b[32m✓ ${config.name} configured successfully\x1b[0m`);
    return provider;
  }
}
