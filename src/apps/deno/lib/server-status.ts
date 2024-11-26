import { serverInfo, stats, edgeProviders } from "./types.ts";

export const ASCII_LOGO = `
  __  __  _____ _____   
 |  \/  |/ ____|  __ \  
 | \  / | |    | |__) | 
 | |\/| | |    |  ___/  
 | |  | | |____| |      
 |_|  |_|\_____|_|      
`;

export function displayServerStatus() {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', ASCII_LOGO);
  console.log('\x1b[33m=== MCP Server Status ===\x1b[0m');
  console.log('\x1b[32m✓ Server Running\x1b[0m');
  console.log(`\x1b[37m• Port: 3000`);
  console.log(`• Active Connections: ${stats.connections}`);
  console.log(`• Server Name: ${serverInfo.name}`);
  console.log(`• Version: ${serverInfo.version}\x1b[0m`);
  
  console.log('\n\x1b[33m=== Edge Functions ===\x1b[0m');
  console.log(`\x1b[37m• Status: ${stats.edgeFunctionsEnabled ? '\x1b[32mEnabled\x1b[0m' : '\x1b[31mDisabled\x1b[0m'}`);
  if (stats.selectedProvider) {
    console.log(`• Provider: ${edgeProviders[stats.selectedProvider].name}`);
  }
  console.log('• Active Functions:', stats.activeEdgeFunctions.length ? stats.activeEdgeFunctions.join(', ') : 'None');
  if (stats.lastDeployment) {
    console.log(`• Last Deployment: ${stats.lastDeployment}`);
  }
  if (Object.keys(stats.deployedUrls).length > 0) {
    console.log('\n• Deployed URLs:');
    for (const [func, url] of Object.entries(stats.deployedUrls)) {
      console.log(`  - ${func}: ${url}`);
    }
  }
  
  console.log('\n\x1b[33m=== Capabilities ===\x1b[0m');
  console.log('\x1b[37m• Models:', serverInfo.capabilities.models?.join(', '));
  console.log('• Protocols:', serverInfo.capabilities.protocols?.join(', '));
  console.log('• Features:', serverInfo.capabilities.features?.join(', '), '\x1b[0m');

  console.log('\n\x1b[33m=== Menu ===\x1b[0m');
  console.log('\x1b[37m[1] View Active Connections');
  console.log('[2] View Server Info');
  console.log('[3] View Capabilities');
  console.log('[4] Configure Edge Functions');
  console.log('[5] Deploy Edge Function');
  console.log('[6] View Edge Function Status');
  console.log('[7] View Edge Function Logs');
  console.log('[8] List Deployed Functions');
  console.log('[9] Refresh Display');
  console.log('[Ctrl+C] Exit Server\x1b[0m');
}
