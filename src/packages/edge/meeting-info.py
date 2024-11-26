import os
import json
from typing import Dict, Any

FIRELIES_API_URL = "https://api.fireflies.ai/graphql"

class FirefliesAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def query_transcript(self, transcript_id: str) -> Dict[str, Any]:
        query = """
        query Transcript($transcriptId: String!) {
            transcript(id: $transcriptId) {
                summary {
                    keywords
                    action_items
                    outline
                    shorthand_bullet
                    overview
                    bullet_gist
                    gist
                    short_summary
                }
            }
        }
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "query": query,
            "variables": {"transcriptId": transcript_id}
        }
        response = requests.post(FIRELIES_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

async def handle_meeting_info(request):
    try:
        if request.method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                'body': ''
            }

        if request.method != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'success': False, 'message': 'Method not allowed'})
            }

        payload = json.loads(request.body)
        if not payload.get('meetingId'):
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'message': 'Invalid payload: missing required fields'})
            }

        api_key = os.getenv("FIREFLIES_API_KEY")
        if not api_key:
            return {
                'statusCode': 500,
                'body': json.dumps({'success': False, 'message': 'Missing Fireflies API key'})
            }

        fireflies_api = FirefliesAPI(api_key)
        transcript_data = fireflies_api.query_transcript(payload['meetingId'])

        response = {
            'success': True,
            'message': 'Meeting info retrieved successfully',
            'data': transcript_data
        }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps(response)
        }

    except Exception as e:
        response = {
            'success': False,
            'message': str(e)
        }
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps(response)
        }
