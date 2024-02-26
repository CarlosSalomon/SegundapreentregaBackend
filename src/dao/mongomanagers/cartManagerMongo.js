import { cartModel } from "../models/carts.model.js"

class CartManager {

  getCarts = async () => {
    try {
      const carts = await cartModel.find();
      return carts;
    } catch (err) {
      console.error('Error al obtener los carritos:', err.message);
      return [];
    }
  };

  getCartById = async (cartId) => {
    try {
      const cart = await cartModel.findById(cartId).lean()
      
      return cart;
    } catch (err) {
      console.error('Error al obtener el carrito por ID:', err.message);
      return err;
    }
  };

  addCart = async (products) => {
    try {
      let cartData = {};
      if (products && products.length > 0) {
        cartData.products = products;
      }
      const cart = await cartModel.create(cartData);
      return cart;
    } catch (err) {
      console.error('Error al crear el carrito:', err.message);
      return err;
    }
  };

  addProductInCart = async (cid, obj, id, quantity) => {
    try {
        const cart = await cartModel.findById(cid);

        // Verifico si el producto ya está en el carrito
        const existingProduct = cart.products.find(product => product._id.toString() === id);

        if (existingProduct) {
            // Actualizo la cantidad del producto en el carrito
            existingProduct.quantity += quantity;
        } else {
            // Agrego el producto al carrito con la cantidad especificada
            cart.products.push({
                _id: obj._id,
                quantity: quantity,
                thumbnail: obj.thumbnail,
                title: obj.title,
                price: obj.price
            });
        }

        await cart.save();
        return await cartModel.findById(cid);
    } catch (err) {
        console.error('Error al agregar el producto al carrito:', err.message);
        return err;
    }
};
  removeProductFromCart = async (cartId, productId) => {
    try {
      const cart = await cartModel.findById(cartId);

      // Encuentro el índice del producto en el carrito
      const productIndex = cart.products.findIndex((product) => product._id.toString() === productId);

      if (productIndex !== -1) {
        // Elimino el producto del carrito
        cart.products.splice(productIndex, 1);
        await cart.save();
        return await cartModel.findById(cartId);
      } else {
        throw new Error('El producto no se encontró en el carrito');
      }
    } catch (err) {
      console.error('Error al eliminar el producto del carrito:', err.message);
      return err;
    }
  };

};



export default CartManager;