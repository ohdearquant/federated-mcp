import asyncio
import websockets
import json
from typing import Dict, Any, List
from auth import AuthManager
from core.types import FederationConfig
from core.schema import JSONRPCMessage

class FederationProxy:
    def __init__(self, secret: str):
        self.servers: Dict[str, FederationConfig] = {}
        self.connections: Dict[str, websockets.WebSocketClientProtocol] = {}
        self.auth_manager = AuthManager(secret)

    async def register_server(self, config: FederationConfig) -> None:
        self.servers[config.server_id] = config
        await self.establish_connection(config)

    async def remove_server(self, server_id: str) -> None:
        connection = self.connections.get(server_id)
        if connection:
            await connection.close()
            del self.connections[server_id]
        if server_id in self.servers:
            del self.servers[server_id]

    async def establish_connection(self, config: FederationConfig) -> None:
        try:
            token = await self.auth_manager.create_token({
                "serverId": config.server_id,
                "type": "federation"
            })

            ws_url = f"{config.endpoints['control']}?token={token}"
            async with websockets.connect(ws_url) as websocket:
                self.connections[config.server_id] = websocket
                await self.handle_messages(config.server_id, websocket)
        except Exception as e:
            print(f"Failed to establish connection with {config.server_id}: {e}")
            raise

    async def handle_messages(self, server_id: str, websocket: websockets.WebSocketClientProtocol) -> None:
        try:
            async for message in websocket:
                try:
                    json_message = json.loads(message)
                    self.handle_message(server_id, json_message)
                except json.JSONDecodeError as e:
                    print(f"Failed to parse message from {server_id}: {e}")
        except websockets.ConnectionClosed:
            print(f"Connection closed with {server_id}")
            del self.connections[server_id]

    def handle_message(self, server_id: str, message: JSONRPCMessage) -> None:
        print(f"Received message from {server_id}: {message}")

    def get_connected_servers(self) -> List[str]:
        return list(self.connections.keys())
