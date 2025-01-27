import OpenAI from "openai";
import ProductService, { Invoice } from "./productService";

const SYSTEM_MESSAGE = [
  "You are a sales manager for for a clothing online store.",
  "Always answer in a sentence or less. Your answer should never be more than 150 words or contain large lists.",
  "Follow the following routine with the user:",
  "1. First, introduce yourself and ask the user what they are looking for. Suggest product categories from existing products.",
  "2. Propose a product.",
  "3. IF the user is satisfied, remember the selected product with its id",
  "4. Ask if the user needs more products",
  "5. IF the user needs more products, repeat step 2",
  "6. ONLY IF the user confirmed that he is done (really make sure by asking for confirmation if the user is done shopping), place the order by calling create_order with the corrects ids and counts and give him a summary of his selections with the total price",
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
  {
    type: "function",
    function: {
      name: "create_order",
      parameters: {
        type: "object",
        description:
          "object containing an array of items. you will need the ids of the products that you obtain from get_all_products",
        properties: {
          items: {
            type: "array",
            description: "array of objects for each item",
            minItems: 1,
            items: {
              type: "object",
              description: "item with product id and count",
              properties: {
                id: {
                  type: "string",
                  description:
                    "id of the product. id is obtained from get_all_products",
                },
                count: {
                  type: "number",
                  description: "desired quantity of the product",
                },
              },
              required: ["id", "count"],
            },
          },
        },
        required: ["items"],
      },
      description:
        "The createOrder function receives an array of objects with product IDs and counts, creates an invoice in JSON format, stores it in orders.json, and returns the invoice JSON.",
      strict: false,
    },
  },
];

enum ACTION_TYPES {
  CONTINUE_CHAT,
  RETURN_INVOICE,
}

type RETURN_INVOICE = {
  type: ACTION_TYPES.RETURN_INVOICE;
  invoice: Invoice;
};

type CONTINUE_CHAT = {
  type: ACTION_TYPES.CONTINUE_CHAT;
  chatCompletion: OpenAI.ChatCompletion;
};

class ChatGPTService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }

  public async callOpenAi(
    msgs: OpenAI.ChatCompletionMessageParam[]
  ): Promise<CONTINUE_CHAT | RETURN_INVOICE> {
    let messages: OpenAI.ChatCompletionMessageParam[] = msgs;
    console.log(
      "calling openai with last message",
      messages?.[messages.length - 1] || "no message"
    );
    const chatCompletion = await this.client.chat.completions.create({
      messages: messages,
      model: "gpt-4o",
      tools: TOOLS,
    });
    const toolCalls = chatCompletion.choices[0].message.tool_calls;
    if (toolCalls?.length) {
      messages.push({
        role: "assistant",
        tool_calls: chatCompletion.choices[0].message.tool_calls,
      });

      for (const toolCall of toolCalls) {
        const productService = new ProductService();
        switch (toolCall.function.name) {
          case "get_all_products":
            const products = productService.getAllProducts();
            messages.push({
              role: "tool",
              content: JSON.stringify(products),
              tool_call_id: toolCall.id,
            });
            continue;
          case "create_order":
            const invoice = productService.createOrder(
              JSON.parse(toolCall.function.arguments)?.items
            );
            return { type: ACTION_TYPES.RETURN_INVOICE, invoice };
          default:
            throw new Error(`Unknown function: ${toolCall.function.name}`);
        }
      }

      return await this.callOpenAi(messages);
    }
    return { type: ACTION_TYPES.CONTINUE_CHAT, chatCompletion };
  }

  public async getResponse(
    message?: string,
    history?: OpenAI.ChatCompletionMessageParam[]
  ): Promise<{
    messages?: OpenAI.ChatCompletionMessageParam[];
    invoice?: Invoice;
  }> {
    let messages: OpenAI.ChatCompletionMessageParam[] = message
      ? [...this.initHistory(history), { role: "user", content: message }]
      : this.initHistory(history);

    const result = await this.callOpenAi(messages);
    if (result.type === ACTION_TYPES.CONTINUE_CHAT) {
      return {
        messages: this.processResponse(result.chatCompletion, history, message),
      };
    } else if (result.type === ACTION_TYPES.RETURN_INVOICE) {
      return { invoice: result.invoice };
    } else {
      throw new Error("Unexpected result type");
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
