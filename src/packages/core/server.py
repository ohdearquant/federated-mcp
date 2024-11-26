import datetime
import json
from typing import List, Dict, Any

class Capabilities:
    def __init__(self, resources: bool, prompts: bool, tools: bool, sampling: bool):
        self.resources = resources
        self.prompts = prompts
        self.tools = tools
        self.sampling = sampling

class ServerInfo:
    def __init__(self, name: str, version: str, capabilities: Capabilities):
        self.name = name
        self.version = version
        self.capabilities = capabilities

class Message:
    def __init__(self, type: str, content: Any):
        self.type = type
        self.content = content

class Response:
    def __init__(self, success: bool, data: Any = None, error: str = None):
        self.success = success
        self.data = data
        self.error = error

class MCPServer:
    def __init__(self, info: ServerInfo):
        self.info = info

    async def handle_websocket(self, websocket):
        async for message in websocket:
            try:
                data = json.loads(message)
                response = await self.handle_message(data)
                await websocket.send(json.dumps(response.__dict__))
            except Exception as e:
                await websocket.send(json.dumps({"success": False, "error": str(e)}))

    async def handle_http(self, request):
        try:
            body = await request.json()
            response = await self.handle_message(body)
            return web.Response(text=json.dumps(response.__dict__), content_type='application/json')
        except Exception as e:
            return web.Response(text=json.dumps({"success": False, "error": str(e)}), content_type='application/json')

    async def handle_message(self, message: Message) -> Response:
        if message.type == 'info':
            return Response(success=True, data=self.info.__dict__)
        elif message.type == 'capabilities':
            return Response(success=True, data=self.info.capabilities.__dict__)
        else:
            return Response(success=False, error='Unknown message type')

    def log(self, level: str, message: str, data: Any = None):
        timestamp = datetime.datetime.utcnow().isoformat()
        log_message = f"[{timestamp}] {level.upper()}: {message}"
        if data:
            log_message += f" | Data: {data}"
        print(log_message)
