# JSON-RPC types in Python

from typing import Union, Optional, Any, Dict

# Base interface for JSON-RPC messages
class JSONRPCBase:
    jsonrpc: str = "2.0"

# Request message
class JSONRPCRequest(JSONRPCBase):
    def __init__(self, method: str, id: Union[int, str], params: Optional[Any] = None):
        self.method = method
        self.id = id
        self.params = params

# Notification message (request without id)
class JSONRPCNotification(JSONRPCBase):
    def __init__(self, method: str, params: Optional[Any] = None):
        self.method = method
        self.params = params

# Success response
class JSONRPCResponse(JSONRPCBase):
    def __init__(self, result: Any, id: Union[int, str]):
        self.result = result
        self.id = id

# Error response
class JSONRPCError(JSONRPCBase):
    def __init__(self, code: int, message: str, id: Optional[Union[int, str]] = None, data: Optional[Any] = None):
        self.error = {
            "code": code,
            "message": message,
            "data": data
        }
        self.id = id

# Union type for all JSON-RPC messages
JSONRPCMessage = Union[JSONRPCRequest, JSONRPCNotification, JSONRPCResponse, JSONRPCError]
