const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
    // Chỗ này để khai báo thuộc tính đối tượng
    idtruyen: String,
    idnguoidung: String,
    noidung: String,
    ngaygiobinhluan: String,
});

const Comments = new mongoose.model("Comments", CommentSchema); // truyền bảng vào đây
module.exports = Comments; 
