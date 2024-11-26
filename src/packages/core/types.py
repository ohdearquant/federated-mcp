from typing import Dict, Any, List, Optional

class Capabilities:
    def __init__(self, models: Optional[List[str]] = None, protocols: Optional[List[str]] = None, features: Optional[List[str]] = None):
        self.models = models
        self.protocols = protocols
        self.features = features

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

class FederationConfig:
    def __init__(self, server_id: str, endpoints: Dict[str, str], auth: Dict[str, Any]):
        self.server_id = server_id
        self.endpoints = endpoints
        self.auth = auth
