import OpenAI from "openai";

class ChatGPTService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }

  public async getResponse(
    message: string,
    history: Array<{ role: string; content: string }>
  ): Promise<Array<{ role: string; content: string }>> {
    console.log(message, history);
    const chatCompletion = await this.client.chat.completions.create({
      messages: [
        ...history.map((msg) => ({
          role: ["system", "user", "assistant"].includes(msg.role)
            ? (msg.role as "system" | "user" | "assistant")
            : "user",
          content: msg.content,
        })),
        { role: "user", content: message },
      ],
      model: "gpt-4",
    });

    if (
      chatCompletion.choices &&
      chatCompletion.choices[0] &&
      chatCompletion.choices[0].message
    ) {
      const botMessage =
        chatCompletion.choices[0].message.content?.trim() || "";
      return [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: botMessage },
      ];
    }
    throw new Error("No response from chat completion");
  }
}

export default ChatGPTService;
