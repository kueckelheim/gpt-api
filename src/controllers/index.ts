import ProductService from "../services/productService";
import ChatGPTService from "../services/chatGPTService";

const productService = new ProductService();
const chatGPTService = new ChatGPTService();

export class IndexController {
  public getIndex(req: any, res: any): void {
    const products = productService.getAllProducts();
    res.render("index", { title: "Home", products, messages: [] });
  }

  public async postMessage(req: any, res: any): Promise<void> {
    const userMessage = req.body.message;
    const botResponse = await chatGPTService.getResponse(userMessage);
    const products = productService.getAllProducts();
    res.render("index", { title: "Home", products, messages: [{ sender: "user", text: userMessage }, { sender: "bot", text: botResponse }] });
  }
}
