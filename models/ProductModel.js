const mongoose = require('mongoose');
const ProductsSchema = new mongoose.Schema({
    // Chỗ này để khai báo thuộc tính đối tượng
    tentruyen: String,
    motangan: String,
    tentacgia: String,
    namxuatban: String,
    anhbia: Object,
    danhsachcacanhnoidungtruyen: [Object], // Change the type to an array of objects for multiple files
});

const Products = new mongoose.model("Products", ProductsSchema); // truyền bảng vào đây
module.exports = Products; 
