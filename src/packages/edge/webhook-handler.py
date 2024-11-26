import json
from typing import Dict, Any

class WebhookHandler:
    def __init__(self):
        pass

    async def handle_webhook(self, request) -> Dict[str, Any]:
        try:
            # Handle CORS preflight
            if request.method == 'OPTIONS':
                return {
                    'status': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                    'body': None
                }

            # Only accept POST requests
            if request.method != 'POST':
                return {
                    'status': 405,
                    'body': json.dumps({
                        'success': False,
                        'message': 'Method not allowed'
                    }),
                    'headers': {
                        'Content-Type': 'application/json'
                    }
                }

            # Parse and validate webhook payload
            payload = await request.json()

            if not payload.get('meetingId') or not payload.get('eventType'):
                return {
                    'status': 400,
                    'body': json.dumps({
                        'success': False,
                        'message': 'Invalid webhook payload: missing required fields'
                    }),
                    'headers': {
                        'Content-Type': 'application/json'
                    }
                }

            # Only process completed transcriptions
            if payload['eventType'] != 'Transcription completed':
                return {
                    'status': 200,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Event type not supported for processing'
                    }),
                    'headers': {
                        'Content-Type': 'application/json'
                    }
                }

            # Process the webhook
            response = {
                'success': True,
                'message': 'Webhook received successfully',
                'data': payload
            }

            return {
                'status': 200,
                'body': json.dumps(response),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            }

        except Exception as e:
            return {
                'status': 500,
                'body': json.dumps({
                    'success': False,
                    'message': str(e)
                }),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            }
