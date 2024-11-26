const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Item = require("./items"); // Ajusta la ruta al modelo correctamente
const User = require("./User"); // Modelo del usuario
const bcrypt = require("bcryptjs");


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/upload", express.static(path.join(__dirname, "upload"))); // Servir archivos estáticos de la carpeta `upload`

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "upload");
    cb(null, uploadPath); // Carpeta de destino
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Guardar con un nombre único
  },
});
const upload = multer({ storage });

// Conexión a MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((error) => console.error("Error al conectar a la base de datos", error));

// Rutas
// Obtener todos los productos
app.get("/products", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

// Obtener productos por usuario
app.get("/items", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "Se requiere userId" });
  }
  try {
    const items = await Item.find({ userId });
    res.json(items);
  } catch (error) {
    console.error("Error al obtener productos por usuario:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

app.post("/items", upload.single("image"), async (req, res) => {
    const { nameItem, descriptionItem, priceItem, quantityItem, itemType, userId } = req.body;

    // Validar si falta algún campo requerido
    if (!nameItem || !descriptionItem || !priceItem || !quantityItem || !itemType || !userId) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Validar el tipo de producto (itemType)
    if (!['computadores', 'celulares', 'electrohogar', 'accesorios', 'zona gamer'].includes(itemType)) {
        return res.status(400).json({ message: "Tipo de producto no válido." });
    }

    // Verificar la presencia de una imagen
    if (!req.file) {
        return res.status(400).json({ message: "Por favor, selecciona una imagen." });
    }

    try {
        const imageUrl = `http://localhost:${process.env.PORT || 5005}/upload/${req.file.filename}`;
        const newItem = new Item({
            nameItem,
            descriptionItem,
            priceItem,
            quantityItem,
            image: imageUrl,
            userId,
            itemType,
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ message: "Hubo un error al agregar el producto." });
    }
});



// Actualizar un producto
app.put("/items/:id", upload.single("image"), async (req, res) => {
  const { nameItem, descriptionItem, priceItem, quantityItem } = req.body;
  const updatedData = { nameItem, descriptionItem, priceItem, quantityItem };

  if (req.file) {
    updatedData.image = `http://localhost:${process.env.PORT || 5005}/upload/${req.file.filename}`;
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedItem);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Hubo un error al actualizar el producto." });
  }
});

// Eliminar un producto
app.delete("/items/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Hubo un error al eliminar el producto." });
  }
});

// Ruta para registrar un nuevo usuario
app.post("/register", async (req, res) => {
    const { name, email, password, accountType } = req.body;

    if (!name || !email || !password || !accountType) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const validAccountTypes = ["comprador", "vendedor"];
    if (!validAccountTypes.includes(accountType)) {
        return res.status(400).json({ message: `accountType debe ser uno de los siguientes: ${validAccountTypes.join(", ")}` });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "El correo ya está registrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            accountType,
        });

        await newUser.save();

        res.status(201).json({ message: "Usuario registrado exitosamente." });
    } catch (error) {
        console.error("Error al registrar usuario:", error.message);
        res.status(500).json({ message: "Hubo un error al registrar el usuario.", error: error.message });
    }
});

// Ruta de inicio de sesión

app.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) { // Comparar usando bcrypt
          return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }

      // Crear un payload con el id del usuario
      const payload = { userId: user._id };

      // Generar un token JWT con una expiración de 1 hora (puedes ajustarlo como necesites)
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      // Devolver el token junto con la información del usuario (opcional)
      res.status(200).json({ success: true, user, token });
  } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      res.status(500).json({ message: 'Error iniciando sesión.', error });
  }
});





// Servidor
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
