const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const DATA_FILE = './products.json';

// ตั้งค่าการเก็บรูปภาพ
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ฟังก์ชันสำหรับอ่าน/เขียนไฟล์ JSON
const getProducts = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]');
const saveProducts = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// --- Routes ---

// 1. หน้าแรก - แสดงสินค้าทั้งหมด
app.get('/', (req, res) => {
    const products = getProducts();
    res.render('index', { products });
});

// 1. หน้าแรก - แสดงสินค้าทั้งหมด
app.get('/admin/', (req, res) => {
    const products = getProducts();
    res.render('index', { products });
});

// 2. หน้าเพิ่มสินค้า
app.get('/add', (req, res) => res.render('add'));

app.post('/add', upload.single('image'), (req, res) => {
    const products = getProducts();
    const newProduct = {
        id: Date.now().toString(),
        name: req.body.name,
        price: req.body.price,
        image: req.file ? req.file.filename : ''
    };
    products.push(newProduct);
    saveProducts(products);
    res.redirect('/');
});

// 3. หน้าแก้ไขสินค้า
app.get('/edit/:id', (req, res) => {
    const products = getProducts();
    const product = products.find(p => p.id === req.params.id);
    res.render('edit', { product });
});

app.post('/edit/:id', upload.single('image'), (req, res) => {
    let products = getProducts();
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index !== -1) {
        products[index].name = req.body.name;
        products[index].price = req.body.price;
        if (req.file) products[index].image = req.file.filename;
        saveProducts(products);
    }
    res.redirect('/');
});

// ลบสินค้า
// app.get('/delete/:id', (req, res) => {
//     let products = getProducts();
//     products = products.filter(p => p.id !== req.params.id);
//     saveProducts(products);
//     res.redirect('/');
// });

// app.listen(3007, () => console.log('Server running at http://localhost:3007'));
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} running at http://localhost:3007`);
});