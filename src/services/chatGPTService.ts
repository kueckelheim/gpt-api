import OpenAI from "openai";
import ProductService from "./productService";

const SYSTEM_MESSAGE = [
  "You are a sales manager for for a clothing online store.",
  "Always answer in a sentence or less.",
  "Follow the following routine with the user:",
  "1. First, introduce yourself and ask probing questions and help the user find the right products.",
  "2. Propose a product.",
  "3. IF the user is satisfied, remember the selected product",
  "4. Ask if the user needs more products",
  "5. IF the user needs more products, repeat step 2",
  "6. IF the user is done, suggest the selected products and calculate the total price",
  "",
];

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_all_products",
      description:
        "Get a list of all available products in the store. Each product has an id, name, price, description and gender.",
      strict: false,
    },
  },
];

class ChatGPTService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }

  public async callOpenAi(
    msgs: OpenAI.ChatCompletionMessageParam[]
  ): Promise<OpenAI.ChatCompletion> {
    let messages: OpenAI.ChatCompletionMessageParam[] = msgs;
    console.log("callOpenAi called", messages);
    const chatCompletion = await this.client.chat.completions.create({
      messages: messages,
      model: "gpt-4o",
      tools: TOOLS,
    });
    if (chatCompletion.choices[0].message.tool_calls?.length) {
      messages = [
        ...messages,
        {
          role: "assistant",
          tool_calls: chatCompletion.choices[0].message.tool_calls,
        },
      ];
      console.log("tool calls: ", chatCompletion.choices[0].message.tool_calls);
      const toolCallMessages = await this.handleToolCalls(
        chatCompletion.choices[0].message.tool_calls
      );
      messages = [...messages, ...toolCallMessages];
      return await this.callOpenAi(messages);
    }
    return chatCompletion;
  }

  public async getResponse(
    message?: string,
    history?: OpenAI.ChatCompletionMessageParam[]
  ): Promise<OpenAI.ChatCompletionMessageParam[]> {
    let messages: OpenAI.ChatCompletionMessageParam[] = message
      ? [...this.initHistory(history), { role: "user", content: message }]
      : this.initHistory(history);

    const chatCompletion = await this.callOpenAi(messages);
    console.log(chatCompletion);
    return this.processResponse(chatCompletion, history, message);
  }

  private async handleToolCalls(
    toolCalls: OpenAI.ChatCompletionMessageToolCall[]
  ): Promise<OpenAI.ChatCompletionMessageParam[]> {
    const messages = [];
    for (const toolCall of toolCalls) {
      const result = await this.executeToolCall(toolCall);
      const resultMessage: OpenAI.ChatCompletionToolMessageParam = {
        role: "tool",
        content: result,
        tool_call_id: toolCall.id,
      };
      messages.push(resultMessage);
    }
    return messages;
  }

  private async executeToolCall(
    toolCall: OpenAI.ChatCompletionMessageToolCall
  ): Promise<string> {
    switch (toolCall.function.name) {
      case "get_all_products":
        const productService = new ProductService();
        const products = productService.getAllProducts();
        return JSON.stringify(products);
      default:
        throw new Error(`Unknown function: ${toolCall.function.name}`);
    }
  }

  private initHistory(
    history?: OpenAI.ChatCompletionMessageParam[]
  ): OpenAI.ChatCompletionMessageParam[] {
    return history || [{ role: "system", content: SYSTEM_MESSAGE.join("\n") }];
  }

  private processResponse(
    chatCompletion: OpenAI.ChatCompletion,
    history?: OpenAI.ChatCompletionMessageParam[],
    message?: string
  ): OpenAI.ChatCompletionMessageParam[] {
    if (
      chatCompletion.choices &&
      chatCompletion.choices[0] &&
      chatCompletion.choices[0].message
    ) {
      const botMessage =
        chatCompletion.choices[0].message.content?.trim() || "";
      const updatedHistory: OpenAI.ChatCompletionMessageParam[] = [
        ...(history || []),
        ...(message ? [{ role: "user" as "user", content: message }] : []),
        { role: "assistant", content: botMessage },
      ];
      return updatedHistory;
    }
    throw new Error("No response from chat completion");
  }
}

export default ChatGPTService;
