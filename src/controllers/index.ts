import ProductService from "../services/productService";
import ChatGPTService from "../services/chatGPTService";

const productService = new ProductService();
const chatGPTService = new ChatGPTService();

export class IndexController {
  public async getIndex(req: any, res: any): Promise<void> {
    const products = productService.getAllProducts();
    const initialHistory = await chatGPTService.getResponse();
    res.render("index", { title: "Home", products, messages: initialHistory });
  }

  public async postMessage(req: any, res: any): Promise<void> {
    const userMessage = req.body.message;
    const history = JSON.parse(req.body.history);
    const updatedHistory = await chatGPTService.getResponse(
      userMessage,
      history
    );
    const products = productService.getAllProducts();
    res.render("index", {
      title: "Home",
      products,
      messages: updatedHistory,
    });
  }
}
