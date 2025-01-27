import ChatGPTService from "../services/chatGPTService";

const chatGPTService = new ChatGPTService();

export class IndexController {
  public async getIndex(req: any, res: any): Promise<void> {
    const { messages } = await chatGPTService.getResponse();
    res.render("index", { title: "Home", messages });
  }

  public async postMessage(req: any, res: any): Promise<void> {
    const userMessage = req.body.message;
    const history = JSON.parse(req.body.history);
    const { messages, invoice } = await chatGPTService.getResponse(
      userMessage,
      history
    );
    res.render("index", {
      title: "Home",
      messages,
      invoice,
    });
  }
}
