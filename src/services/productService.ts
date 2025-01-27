import * as fs from "fs";
import * as path from "path";

const productsFilePath = path.join(__dirname, "products.json");

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  gender: string;
}

class ProductService {
  private products: Product[];

  constructor() {
    this.products = this.loadProducts();
  }

  private loadProducts(): Product[] {
    if (fs.existsSync(productsFilePath)) {
      const data = fs.readFileSync(productsFilePath, "utf-8");
      return JSON.parse(data);
    }
    return [];
  }

  public getAllProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: number): Product | undefined {
    return this.products.find((product) => product.id === id);
  }
}

export default ProductService;
