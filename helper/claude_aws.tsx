import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";


// Configure the AWS Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Use Claude Opus - this model is widely available and excellent for analysis
const modelId = "us.anthropic.claude-opus-4-20250514-v1:0";

/**
 * Sends a prompt to the Claude model using the Converse API.
 */
export const askClaude = async (prompt: string): Promise<string> => {
  console.log(`Sending prompt to Claude: "${prompt}"`);

  const command = new ConverseCommand({
    modelId: modelId,
    messages: [{ role: "user", content: [{ text: prompt }] }],
    inferenceConfig: {
      maxTokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent scientific analysis
    },
  });

  try {
    const response = await client.send(command);
    const responseText = response.output?.message?.content?.[0]?.text;
    
    if (!responseText) {
      throw new Error("No response text received from Claude");
    }
    
    console.log("Claude Response:", responseText);
    return responseText;
  } catch (err) {
    console.error("Error invoking model:", err);
    throw new Error("Failed to get response from Claude.");
  }
};