import { stats, edgeProviders } from "./types.ts";
import { SupabaseDeployer } from "../../../../packages/edge/supabase-deploy.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { displayServerStatus } from "./server-status.ts";

const supabaseDeployer = new SupabaseDeployer();

export async function viewEdgeFunctionStatus() {
  console.log('\n\x1b[35m=== Edge Function Status ===\x1b[0m');
  if (stats.edgeFunctionsEnabled) {
    if (stats.activeEdgeFunctions.length === 0) {
      console.log('\x1b[33m! No edge functions deployed\x1b[0m');
    } else {
      for (const func of stats.activeEdgeFunctions) {
        console.log(`\x1b[32m✓ ${func} (running)\x1b[0m`);
        if (stats.deployedUrls[func]) {
          console.log(`  URL: ${stats.deployedUrls[func]}`);
        }
      }
    }
  } else {
    console.log('\x1b[31m✗ Edge functions are disabled\x1b[0m');
  }
}

export async function viewEdgeFunctionLogs() {
  console.log('\n\x1b[35m=== Edge Function Logs ===\x1b[0m');
  if (stats.edgeFunctionsEnabled && stats.activeEdgeFunctions.length > 0) {
    if (stats.selectedProvider === 'supabase') {
      for (const func of stats.activeEdgeFunctions) {
        console.log(`\n\x1b[33m${func} Logs:\x1b[0m`);
        const logs = await supabaseDeployer.getFunctionLogs(func);
        logs.forEach(log => console.log(log));
      }
    } else {
      console.log('\x1b[31m✗ Logs not supported for current provider\x1b[0m');
    }
  } else {
    console.log('\x1b[31m✗ No active edge functions\x1b[0m');
  }
}

export async function toggleEdgeFunctions() {
  let anyConfigured = false;
  for (const provider of Object.values(edgeProviders)) {
    if (provider.isConfigured()) {
      anyConfigured = true;
      break;
    }
  }

  if (!anyConfigured) {
    console.log('\n\x1b[33m! No edge function providers configured\x1b[0m');
    console.log('Would you like to configure a provider now? (y/n)');
    
    for await (const line of readLines(Deno.stdin)) {
      const choice = line.trim().toLowerCase();
      if (choice === 'y' || choice === 'yes') {
        const provider = await configureProvider();
        if (provider) {
          stats.selectedProvider = provider;
          stats.edgeFunctionsEnabled = true;
          console.log('\n\x1b[32m✓ Edge functions enabled\x1b[0m');
        }
        break;
      } else if (choice === 'n' || choice === 'no') {
        console.log('\n\x1b[31m✗ Edge functions remain disabled\x1b[0m');
        break;
      }
      console.log('\x1b[31m✗ Invalid choice. Please enter y or n\x1b[0m');
    }
  } else if (!stats.edgeFunctionsEnabled) {
    console.log('\n\x1b[35m=== Select Edge Function Provider ===\x1b[0m');
    const availableProviders = Object.entries(edgeProviders)
      .filter(([_, provider]) => provider.isConfigured());
    
    availableProviders.forEach((([key, provider], index) => {
      console.log(`${index + 1}. ${provider.name}`);
    }));
    console.log(`${availableProviders.length + 1}. Cancel`);

    for await (const line of readLines(Deno.stdin)) {
      const choice = parseInt(line.trim());
      if (choice > 0 && choice <= availableProviders.length) {
        stats.selectedProvider = availableProviders[choice - 1][0];
        stats.edgeFunctionsEnabled = true;
        console.log(`\n\x1b[32m✓ Edge functions enabled using ${edgeProviders[stats.selectedProvider].name}\x1b[0m`);
        break;
      } else if (choice === availableProviders.length + 1) {
        console.log('\n\x1b[31m✗ Edge functions remain disabled\x1b[0m');
        break;
      }
      console.log('\x1b[31m✗ Invalid choice\x1b[0m');
    }
  } else {
    stats.edgeFunctionsEnabled = false;
    stats.selectedProvider = undefined;
    stats.activeEdgeFunctions = [];
    console.log('\n\x1b[31m✗ Edge functions disabled\x1b[0m');
  }
  
  displayServerStatus();
}
