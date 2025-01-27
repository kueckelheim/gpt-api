import ProductService from "../services/productService";

const productService = new ProductService();

export class IndexController {
  public getIndex(req: any, res: any): void {
    const products = productService.getAllProducts();
    res.render("index", { title: "Home", products });
  }
}
