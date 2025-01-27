import OpenAI from "openai";

class ChatGPTService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }

  public async getResponse(message: string): Promise<string> {
    const chatCompletion = await this.client.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-4o",
    });

    if (
      chatCompletion.choices &&
      chatCompletion.choices[0] &&
      chatCompletion.choices[0].message
    ) {
      return chatCompletion.choices[0]?.message?.content?.trim() || "";
    }
    throw new Error("No response from chat completion");
  }
}

export default ChatGPTService;
