import * as fs from "fs";
import * as path from "path";

const productsFilePath = path.join(__dirname, "products.json");
const ordersFilePath = path.join(__dirname, "orders.json");

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  gender: string;
}

interface OrderItem {
  id: number;
  count: number;
}

interface Invoice {
  id: number;
  items: { product: Product; count: number }[];
  total: number;
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

  public createOrder(orderItems: OrderItem[]): Invoice {
    const invoiceItems = orderItems.map((item) => {
      const product = this.getProductById(item.id);
      if (!product) {
        throw new Error(`Product with id ${item.id} not found`);
      }
      return { product, count: item.count };
    });

    const total = invoiceItems.reduce(
      (sum, item) => sum + item.product.price * item.count,
      0
    );

    const invoice: Invoice = {
      id: Date.now(),
      items: invoiceItems,
      total,
    };

    let orders = [];
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, "utf-8");
      orders = JSON.parse(data);
    }
    orders.push(invoice);
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));

    return invoice;
  }
}

export default ProductService;
