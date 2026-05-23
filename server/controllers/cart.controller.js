import Cart from "../models/Cart.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });
    res.status(200).json(cart);
  } catch (error) {
    console.error("getCart error:", error.message);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { productId, name, price, image, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !name || price === undefined) {
    return res.status(400).json({ message: "productId, name and price are required" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    // ✅ FIX: compare as strings on BOTH sides — no ObjectId conversion
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    console.log("📦 Existing item index:", existingIndex, "for productId:", productId);
    console.log("🛒 Current cart items:", cart.items.map(i => i.productId.toString()));

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
      console.log("✅ Incremented quantity for:", name);
    } else {
      // ✅ FIX: store productId as STRING not ObjectId to avoid comparison issues
      cart.items.push({
        productId: productId.toString(),
        name,
        price: Number(price),
        image: image || "",
        quantity: quantity || 1,
      });
      console.log("✅ Added new item:", name, "Total items now:", cart.items.length);
    }

    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity, 0
    );

    await cart.save();
    console.log("✅ Cart saved. Total items:", cart.items.length);
    return res.status(200).json(cart);

  } catch (error) {
    console.error("❌ addToCart error:", error.message);
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId.toString()
    );

    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity, 0
    );

    await cart.save();
    console.log("✅ Item removed, remaining:", cart.items.length);
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ removeFromCart error:", error.message);
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
};
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalAmount: 0 },
      { new: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};