
const { PubSub } = require('@google-cloud/pubsub');
const protobuf = require('protobufjs');

// Initialize Pub/Sub client and load Protobuf schema once, outside the function handler.
// This improves performance by avoiding re-initialization on every function invocation.
const pubsub = new PubSub();
const topicName = 'projects/bia-demos/topics/devfest-comments-topic';

// Define the Protocol Buffer schema as an inline string. This makes the function
// self-contained and avoids file-loading errors that can cause the container to fail on startup.
const protoSource = `
syntax = "proto3";
message ProtocolBuffer {
  string usertag = 1;
  string comment = 2;
}`;

let FeedbackMessage;
try {
  // Parse the inline schema definition.
  const root = protobuf.parse(protoSource).root;
  FeedbackMessage = root.lookupType('ProtocolBuffer');
} catch (error) {
  console.error('Failed to parse inline protobuf schema:', error);
  // If the schema is invalid, the function is non-operational.
  // Throw an error during initialization so the issue is immediately visible in logs.
  throw new Error('Could not parse Protobuf schema. Function cannot start.');
}


/**
 * A Google Cloud Function that receives feedback via a POST request,
 * serializes it using Protocol Buffers, and publishes it to a Pub/Sub topic.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.submitFeedback = async (req, res) => {
  // Set CORS headers to allow requests from any origin.
  // This is necessary for web browsers to call the function.
  res.set('Access-Control-Allow-Origin', '*');

  // Handle CORS preflight requests (sent by browsers before the actual POST).
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  // Ensure the request method is POST for the actual feedback submission.
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }
  
  try {
    const { usertag, comment } = req.body;

    // Validate the incoming data from the request body.
    if (!usertag || typeof usertag !== 'string' || usertag.trim() === '') {
      return res.status(400).send({ error: 'Bad Request: A valid "usertag" is required.' });
    }
    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return res.status(400).send({ error: 'Bad Request: A valid "comment" is required.' });
    }

    // Create a payload object matching the structure of our Protocol Buffer message.
    const payload = { usertag: usertag, comment: comment };

    // Verify that the payload is valid according to the schema.
    const verificationError = FeedbackMessage.verify(payload);
    if (verificationError) {
      console.error('Protobuf verification failed:', verificationError);
      // This indicates a mismatch between the expected data and the schema.
      return res.status(500).send({ error: 'Internal Server Error: Invalid payload structure.' });
    }
    
    // Create a new message instance from the valid payload.
    const message = FeedbackMessage.create(payload);
    
    // Encode the message into a binary buffer for publishing.
    const buffer = FeedbackMessage.encode(message).finish();

    // Publish the binary message to the specified Pub/Sub topic.
    const messageId = await pubsub.topic(topicName).publishMessage({ data: buffer });
    console.log(`Message ${messageId} published successfully to topic ${topicName}.`);

    // Send a success response back to the client.
    res.status(200).send({ 
      success: true, 
      message: 'Feedback submitted successfully.', 
      messageId: messageId 
    });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).send({ error: 'Internal Server Error: Failed to process feedback.' });
  }
};
