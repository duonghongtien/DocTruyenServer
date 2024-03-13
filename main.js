const express = require('express');
const mongoose = require('mongoose');
const port = 3000;
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); //Cấu hình engine trong ejs
app.use(express.json()); // Kích hoạt chức năng phân tích JSON


mongoose.connect('mongodb://localhost:27017/TruyenTranh', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Đã kết nối tới MongoDB');
    })
    .catch((error) => {
        console.error('Lỗi kết nối tới MongoDB:', error);
    });


    const User = require('./models/UserModel');
    const Products = require('./models/ProductModel');
    const Comments = require('./models/CommentModel');
    


app.get('/loginScreen', (req, res) => {
    res.render("D:/AssignmentAndroidNetworking/views/LoginScreen.ejs");

});
app.get('/homeScreen', (req, res) => {
    res.render("D:/AssignmentAndroidNetworking/views/HomeScreen.ejs");

});

app.get('/listProductScreen', (req, res) => {
    res.render("D:/AssignmentAndroidNetworking/views/ListProductScreen.ejs");

});


app.get('/insertProductScreen', (req, res) => {
    res.render("D:/AssignmentAndroidNetworking/views/insertProductScreen.ejs");

});

app.get('/registerUserScreen', (req, res) => {
    res.render("D:/AssignmentAndroidNetworking/views/RegisterScreen.ejs");

});

app.get('/updateProductScreen', (req, res) => {
    res.render("D:/AssignmentAndroidNetworking/views/UpdateProductScreen.ejs");

});



const multer = require('multer');
const path = require('path');
// Cấu hình multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Chọn thư mục lưu trữ cho từng loại file
        if (file.fieldname === 'anhbia') {
            cb(null, 'images'); // Thư mục cho ảnh bìa
        } else if (file.fieldname === 'danhsachcacanhnoidungtruyen') {
            cb(null, 'pdf'); // Thư mục cho danh sách ảnh nội dung truyện (pdf)
        } else {
            cb({ error: 'Invalid field name' });
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});



const upload = multer({ storage: storage });
app.use('/images', express.static('images'));
app.use('/pdf', express.static('pdf'));

// Xử lý POST request
app.post("/product/post", upload.fields([{ name: 'anhbia', maxCount: 1 }, { name: 'danhsachcacanhnoidungtruyen', maxCount: 1 }]), (req, res) => {
    // Access the uploaded files using req.files
    console.log(req.files);

    // Kiểm tra xem các file đã được tải lên chưa
    if (!req.files['anhbia'] || !req.files['danhsachcacanhnoidungtruyen']) {
        return res.status(400).json({ error: "Vui lòng tải lên cả ảnh bìa và danh sách ảnh nội dung truyện." });
    }

    const newData = new Products({
        tentruyen: req.body.tentruyen,
        motangan: req.body.motangan,
        tentacgia: req.body.tentacgia,
        namxuatban: req.body.namxuatban,
        anhbia: { filename: req.files['anhbia'][0].filename }, // Lưu tên file ảnh bìa
        danhsachcacanhnoidungtruyen: { filename: req.files['danhsachcacanhnoidungtruyen'][0].filename }, // Lưu tên file pdf
    });

    newData
        .save()
        .then(() => {
            res.status(200).json({ message: "Post sản phẩm thành công" });
        })
        .catch((error) => {
            res.status(500).json({ error: "Post sản phẩm không thành công" });
        });
});


// Xử lý PUT request để sửa sản phẩm
app.put("/product/update/:productId", upload.fields([{ name: 'anhbia', maxCount: 1 }, { name: 'danhsachcacanhnoidungtruyen', maxCount: 1 }]), (req, res) => {
    // Lấy ID sản phẩm từ đường dẫn
    const productId = req.params.productId;

    // Access the uploaded files using req.files (nếu có)
    console.log(req.files);

    // Tìm sản phẩm theo ID
    Products.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
            }

            // Cập nhật thông tin sản phẩm nếu có
            product.tentruyen = req.body.tentruyen || product.tentruyen;
            product.motangan = req.body.motangan || product.motangan;
            product.tentacgia = req.body.tentacgia || product.tentacgia;
            product.namxuatban = req.body.namxuatban || product.namxuatban;

            // Cập nhật ảnh bìa nếu có
            if (req.files && req.files['anhbia']) {
                product.anhbia = { filename: req.files['anhbia'][0].filename };
            }

            // Cập nhật danh sách ảnh nội dung truyện nếu có
            if (req.files && req.files['danhsachcacanhnoidungtruyen']) {
                product.danhsachcacanhnoidungtruyen = { filename: req.files['danhsachcacanhnoidungtruyen'][0].filename };
            }

            // Lưu lại thông tin cập nhật
            return product.save();
        })
        .then(() => {
            res.status(200).json({ message: "Cập nhật sản phẩm thành công" });
        })
        .catch(error => {
            res.status(500).json({ error: "Cập nhật sản phẩm không thành công" });
        });
});


app.delete("/product/delete/:productId", async (req, res) => {
    const productId = req.params.productId;

    try {
        // Kiểm tra xem sản phẩm có tồn tại không
        const existingProduct = await Products.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại" });
        }

        // Xóa sản phẩm từ cơ sở dữ liệu
        await existingProduct.deleteOne();

        res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error);
        res.status(500).json({ error: "Xóa sản phẩm không thành công" });
    }
});


app.post("/user/post", (req, res) => {
    console.log(req.body.brand);
    const newData = new User({
        taikhoan: req.body.taikhoan,
        matkhau: req.body.matkhau,
        email: req.body.email,
        fullname: req.body.fullname,
    });
    newData
        .save()
        .then(() => {
            res.status(200).json({ message: "Post tài khoản thành công" });
        })
        .catch((error) => {
            res.status(500).json({ error: "Post tài khoản không thành công" });
        });
});


// app.post("/comment/post", (req, res) => {
//     try {
//         const truyen = await Products.findById(req.body.idtruyen);
//         const nguoiDung = await User.findById(req.body.idnguoidung);

//         if (!truyen || !nguoiDung) {
//             return res.status(404).json({ error: "Không tìm thấy thông tin truyen hoặc nguoidung" });
//         }

//         const newComment = new Comments({
//             idtruyen: req.body.idtruyen,
//             idnguoidung: req.body.idnguoidung,
//             noidung: req.body.noidung,
//             ngaygiobinhluan: req.body.ngaygiobinhluan,
//         });

//         newComment.save()
//             .then(() => {
//                 res.status(200).json({ message: "Post tài khoản thành công" });
//             })
//             .catch((error) => {
//                 res.status(500).json({ error: "Post tài khoản không thành công" });
//             });
//     } catch (error) {
//         res.status(500).json({ error: "Lỗi khi truy cập cơ sở dữ liệu" });
//     }
// });



app.post("/login/user", async (req, res) => {
    const taikhoan = req.body.taikhoan;
    const matkhau = req.body.matkhau;
    const user = await User.findOne({ taikhoan: taikhoan, matkhau: matkhau });

    if (user) {
        res.json({ message: 'Đăng nhập thành công', _id: user._id });
    } else {
        res.status(400).json({ message: "Sai tài khoản mật khẩu" });
    }
});




// app.post("/product/post", (req, res) => {
//     console.log(req.body.brand);
//     const newData = new Products({
//         tentruyen: req.body.tentruyen,
//         motangan: req.body.motangan,
//         tentacgia: req.body.tentacgia,
//         namxuatban: req.body.namxuatban,
//         anhbia: req.body.anhbia,
//         danhsachcacanhnoidungtruyen: req.body.danhsachcacanhnoidungtruyen,
//     });
//     newData
//         .save()
//         .then(() => {
//             res.status(200).json({ message: "Post sản phẩm thành công" });
//         })
//         .catch((error) => {
//             res.status(500).json({ error: "Post sản phẩm không thành công" });
//         });
// });



app.get("/products", async (req, res) => {
    //lấy tất cả dữ liệu từ MongoDB
    try {
        const products = await Products.find({});
        res.json(products);

    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/products/:productId", async (req, res) => {
    const productId = req.params.productId;

    try {
        const product = await Products.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại" });
        }

        res.json(product);
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
});





// app.get("/products", async (req, res) => {
//     try {
//         const products = await Products.find({});
//         res.render("ListProductScreen", { products });
//     } catch (err) {
//         console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
//         res.status(500).send("Lỗi máy chủ nội bộ");
//     }
// });

app.get("/getPDFURL", (req, res) => {
    // Đường dẫn tới thư mục chứa file PDF
    const pdfDirectory = '/pdf'; // Thay đổi đường dẫn này nếu thư mục của bạn khác

    // Tên file PDF (ví dụ: sample.pdf)
    const pdfFileName = '1709824836607.pdf'; // Thay đổi tên file này nếu tên file của bạn khác

    // Kết hợp đường dẫn và tên file để có URL đầy đủ
    const pdfURL = `${req.protocol}://${req.get("host")}${pdfDirectory}/${pdfFileName}`;

    res.send(`URL của file PDF là: ${pdfURL}`);
});

app.listen(port, () => {
    console.log(`Server đang lắng nghe tại cổng ${port}`);
});


app.post("/comment/post", async (req, res) => {
    try {
        const truyen = await Products.findById(req.body.idtruyen);
        const nguoiDung = await User.findById(req.body.idnguoidung);

        if (!truyen || !nguoiDung) {
            return res.status(404).json({ error: "Không tìm thấy thông tin truyen hoặc nguoidung" });
        }

        const newComment = new Comments({
            idtruyen: req.body.idtruyen,
            idnguoidung: req.body.idnguoidung,
            noidung: req.body.noidung,
            ngaygiobinhluan: req.body.ngaygiobinhluan,
        });

        newComment.save()
            .then(() => {
                res.status(200).json({ message: "Post tài khoản thành công" });
            })
            .catch((error) => {
                res.status(500).json({ error: "Post tài khoản không thành công" });
            });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi truy cập cơ sở dữ liệu" });
    }
});

app.get("/comment/get/:idtruyen", async (req, res) => {
    try {
        const idTruyen = req.params.idtruyen;

        // Tìm tất cả các bình luận có idtruyen tương ứng
        const comments = await Comments.find({ idtruyen: idTruyen });

        if (!comments) {
            return res.status(404).json({ error: "Không tìm thấy bình luận cho truyện này" });
        }

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi truy cập cơ sở dữ liệu" });
    }
});

app.get("/comments", async (req, res) => {
    //lấy tất cả dữ liệu từ MongoDB
    try {
        const comments = await Comments.find({});
        res.json(comments);

    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).send("Internal Server Error");
    }
});