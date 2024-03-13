const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    // Chỗ này để khai báo thuộc tính đối tượng
    taikhoan: String,
    matkhau: String,
    email: String,
    fullname: String,
});

const User = new mongoose.model("Users", UserSchema); // truyền bảng vào đây
module.exports = User; 

