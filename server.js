const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// HTTP SERVER + SOCKET.IO
// =====================================

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// SOCKET.IO CONNECTION
// =====================================

io.on("connection", (socket) => {

    console.log("🔌 User connected:", socket.id);

    socket.on("joinUser", (email) => {

        if (email) {
            socket.join(`user_${email}`);
            console.log(`👤 User joined notification room: ${email}`);
        }

    });

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
    });

});

// =====================================
// MYSQL CONNECTION
// =====================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =====================================
// TEST MYSQL CONNECTION
// =====================================

async function testDatabase() {

    try {

        const connection = await db.getConnection();

        console.log("✅ MySQL connected successfully!");

        connection.release();

    } catch (error) {

        console.error("❌ MySQL connection failed!");
        console.error(error.message);

    }

}

testDatabase();

// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});

// =====================================
// CREATE ORDER
// =====================================

app.post("/api/orders", async (req, res) => {

    try {

        const {
            customer_name,
            customer_email,
            product_name,
            product_image,
            quantity,
            price
        } = req.body;

        // Validate
        if (
            !customer_name ||
            !customer_email ||
            !product_name ||
            price === undefined
        ) {

            return res.status(400).json({
                success: false,
                message: "Required order details are missing"
            });

        }

        const qty = Number(quantity) || 1;

        const productPrice = Number(price);

        const totalAmount = qty * productPrice;

        // Generate order ID
        const orderId =
            "BN" +
            Date.now() +
            Math.floor(Math.random() * 1000);

        const sql = `
            INSERT INTO orders
            (
                order_id,
                customer_name,
                customer_email,
                product_name,
                product_image,
                quantity,
                price,
                total_amount,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            orderId,
            customer_name,
            customer_email,
            product_name,
            product_image || "",
            qty,
            productPrice,
            totalAmount,
            "Processing"
        ];

        const [result] = await db.execute(sql, values);

        // =====================================
        // REAL-TIME NOTIFICATION
        // =====================================

        const notification = {

            type: "order",

            title: "🎉 Order Placed",

            message:
                `Your order for "${product_name}" has been placed successfully.`,

            orderId: orderId,

            status: "Processing",

            productName: product_name,

            productImage: product_image || "",

            time: new Date().toISOString()

        };

        // Send notification only to this customer
        io.to(`user_${customer_email}`)
            .emit("newNotification", notification);

        // Response
        res.status(201).json({

            success: true,

            message: "Order placed successfully",

            order: {

                id: result.insertId,

                order_id: orderId,

                customer_name,

                customer_email,

                product_name,

                product_image: product_image || "",

                quantity: qty,

                price: productPrice,

                total_amount: totalAmount,

                status: "Processing"

            }

        });

    } catch (error) {

        console.error(
            "Order creation error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to create order",

            error: error.message

        });

    }

});

// =====================================
// GET ALL ORDERS
// =====================================

app.get("/api/orders", async (req, res) => {

    try {

        const [orders] = await db.execute(`
            SELECT *
            FROM orders
            ORDER BY created_at DESC
        `);

        res.json({

            success: true,

            orders

        });

    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch orders"

        });

    }

});

// =====================================
// GET ORDERS BY EMAIL
// =====================================

app.get("/api/orders/:email", async (req, res) => {

    try {

        const email = req.params.email;

        const [orders] = await db.execute(
            `
            SELECT *
            FROM orders
            WHERE customer_email = ?
            ORDER BY created_at DESC
            `,
            [email]
        );

        res.json({

            success: true,

            orders

        });

    } catch (error) {

        console.error(
            "Get customer orders error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch customer orders"

        });

    }

});

// =====================================
// UPDATE ORDER STATUS
// =====================================

app.put("/api/orders/:orderId/status", async (req, res) => {

    try {

        const orderId = req.params.orderId;

        const { status } = req.body;

        if (!status) {

            return res.status(400).json({

                success: false,

                message: "Status is required"

            });

        }

        // Get order first
        const [orders] = await db.execute(
            `
            SELECT *
            FROM orders
            WHERE order_id = ?
            `,
            [orderId]
        );

        if (orders.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }

        const order = orders[0];

        // Update status
        const [result] = await db.execute(
            `
            UPDATE orders
            SET status = ?
            WHERE order_id = ?
            `,
            [status, orderId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }

        // =====================================
        // REAL-TIME STATUS NOTIFICATION
        // =====================================

        const notification = {

            type: "status",

            title: "📦 Order Update",

            message:
                `Your order "${order.product_name}" is now ${status}.`,

            orderId: order.order_id,

            status: status,

            productName: order.product_name,

            productImage: order.product_image || "",

            time: new Date().toISOString()

        };

        // Send to customer's room
        io.to(`user_${order.customer_email}`)
            .emit("newNotification", notification);

        // Response
        res.json({

            success: true,

            message: "Order status updated",

            order: {

                order_id: order.order_id,

                status: status

            }

        });

    } catch (error) {

        console.error(
            "Update status error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to update order status"

        });

    }

});

// =====================================
// SERVER START
// =====================================

server.listen(PORT, () => {

    console.log("------------------------------------");

    console.log("🚀 BuyNest Server Started");

    console.log(`🌐 http://localhost:${PORT}`);

    console.log("🔔 Real-time notifications enabled");

    console.log("------------------------------------");

});