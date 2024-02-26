import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/mongomanagers/productManagerMongo.js";
import CartManager from '../dao/mongomanagers/cartManagerMongo.js';
import { productsModel } from '../dao/models/products.model.js';

const cmanager = new CartManager();
const pmanager = new ProductManager()

const router = Router()

router.get("/", async (req, res) => {
  try {
    let pageNum = parseInt(req.query.page) || 1;
    let itemsPorPage = parseInt(req.query.limit) || 5;
    let sortByPrice = req.query.sort === 'asc' ? 'price' : req.query.sort === 'desc' ? '-price' : null; // Verificar el parámetro de ordenamiento
    const query = {};
    if (sortByPrice) {
      query.sort = sortByPrice;
    }
    const products = await productsModel.paginate({}, { page: pageNum, limit: itemsPorPage, sort: query.sort, lean: true });
    products.prevLink = products.hasPrevPage ? `/?limit=${itemsPorPage}&page=${products.prevPage}` : '';
    products.nextLink = products.hasNextPage ? `/?limit=${itemsPorPage}&page=${products.nextPage}` : '';
    products.page = products.page;
    products.totalPages = products.totalPages;
    console.log(products)
    res.render('home', products)
  } catch (error) {
    console.log('Error al leer los productos', error)
    res.status(500).json({ error: 'error al leer los productos' })
  }
})


router.get("/realtimeproducts", (req, res) => {
  res.render("realtimeproducts")
})

router.get("/cart", async (req, res) => {
  const productsInCart = await cmanager.getCartById("65ca90fcd9c2dcb92a0bb005")
  const productList = Object.values(productsInCart.products)
  res.render("cart", { productList })
})

router.delete('/delete-to-cart', async (req, res) => {
  try {
    const { productId } = req.body;
    const removeCartProduct = await cmanager.removeProductFromCart("65ca90fcd9c2dcb92a0bb005", productId);
    res.json({ success: true, message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ message: 'Error al agregar producto al carrito' });
  }
});

router.post('/add-to-cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cmanager.getCartById("65ca90fcd9c2dcb92a0bb005");
    if (productId) {
      const id = productId;
      const productDetails = await pmanager.getProductById(productId);
      const addedProduct = await cmanager.addProductInCart("65ca90fcd9c2dcb92a0bb005", productDetails, id, quantity);
    }

    res.json({ success: true, message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ message: 'Error al agregar producto al carrito' });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const id = req.params.cid
    const result = await productsModel.findById(id).lean().exec()
    if (result === null) {
      return res.status(404).json({ status: 'error', error: 'product not found' })
    }
    res.render('partials/productDetail', result)
  } catch (error) {
    res.status(500).json({ error: 'error al leer el producto' })
  }
})

router.get("/chat", (req, res) => {
  res.render("chat")
})


export default router