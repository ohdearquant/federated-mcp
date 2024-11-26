import os
import openai
import json
from typing import List, Dict, Any

openai.api_key = os.getenv("OPENAI_API_KEY")

INTENT_DETECTION_PROMPT = """
Analyze the following meeting segment and identify any specific intents:
[SEGMENT]

Classify the intent into one of the following categories:
- Task Assignment
- Follow-up Required
- Decision Made
- Question Asked
- Commitment Made
- Meeting Scheduled

For each intent detected:
1. Specify the intent type
2. Extract relevant entities
3. Identify the key action items
4. Determine the level of confidence
5. Note any dependencies or context

Provide the analysis in a structured JSON format matching this Python class:

class DetectedIntent:
    def __init__(self, type: str, confidence: float, segment: dict, metadata: dict):
        self.type = type
        self.confidence = confidence
        self.segment = segment
        self.metadata = metadata

Return a list of DetectedIntent objects.
"""

class DetectedIntent:
    def __init__(self, type: str, confidence: float, segment: dict, metadata: dict):
        self.type = type
        self.confidence = confidence
        self.segment = segment
        self.metadata = metadata

async def detect_intents(segment: str) -> List[DetectedIntent]:
    try:
        prompt = INTENT_DETECTION_PROMPT.replace('[SEGMENT]', segment)
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI trained to detect intents in meeting transcripts."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        content = response.choices[0].message['content']
        return [DetectedIntent(**intent) for intent in json.loads(content)]
    except Exception as e:
        print('Error detecting intents:', e)
        raise e

async def handle_intent_detection(request):
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
        if not payload.get('meetingId') or not payload.get('transcriptionText'):
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'message': 'Invalid payload: missing required fields'})
            }

        segments = [seg for seg in payload['transcriptionText'].split('\n\n') if seg]
        all_intents = []
        for segment in segments:
            intents = await detect_intents(segment)
            all_intents.extend(intents)

        response = {
            'success': True,
            'message': 'Intents detected successfully',
            'data': {
                'meetingId': payload['meetingId'],
                'intentsCount': len(all_intents),
                'intents': [intent.__dict__ for intent in all_intents]
            }
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
