// Memuat isi file .env (PORT dan AMQP_URL) ke process.env; variabel yang sudah diatur di Deployment tidak ditimpa
require('dotenv').config()

// Mengimpor framework Express untuk membuat web server
const express = require("express");
// Membuat instance aplikasi Express
const app = express();

// Mengimpor body-parser untuk membaca body request
const bp = require("body-parser");
// Mengaktifkan parser JSON agar req.body berisi objek dari body JSON
app.use(bp.json());

// Mengimpor amqplib, library klien untuk RabbitMQ (protokol AMQP)
const amqp = require("amqplib");
// Alamat RabbitMQ dibaca dari environment variable AMQP_URL
const amqpServer = process.env.AMQP_URL;
// Variabel untuk menyimpan channel dan connection setelah terhubung
var channel, connection;

// Memanggil fungsi yang membuka koneksi ke RabbitMQ saat aplikasi mulai
connectToQueue();

// Fungsi asinkron untuk terhubung ke RabbitMQ dan menyiapkan antrean
async function connectToQueue() {
    // Membuka koneksi ke RabbitMQ (bila gagal, error tidak ditangkap di sini)
    connection = await amqp.connect(amqpServer);
    // Membuat channel di atas koneksi tersebut
    channel = await connection.createChannel();
    // Blok try untuk menangkap error saat menyiapkan antrean
    try {
        // Nama antrean yang dipakai bersama shipping-service
        const queue = "order";
        // Memastikan antrean "order" ada; dibuat bila belum ada
        await channel.assertQueue(queue);
        // Menandai bahwa koneksi ke antrean berhasil
        console.log("Connected to the queue!")
    // Bila terjadi error pada langkah di atas
    } catch (ex) {
        // Mencatat error ke log
        console.error(ex);
    }
}

// Endpoint POST /order: menerima pesanan dari klien
app.post("/order", (req, res) => {
    // Mengambil properti order dari body JSON
    const { order } = req.body;
    // Mengirim pesanan ke antrean (tidak ditunggu selesai)
    createOrder(order);
    // Membalas klien dengan data pesanan yang diterima
    res.send(order);
});

// Fungsi yang mengirim pesanan sebagai pesan ke antrean RabbitMQ
const createOrder = async order => {
    // Nama antrean tujuan
    const queue = "order";
    // Mengubah pesanan menjadi JSON, lalu Buffer, dan mengirimnya ke antrean
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)));
    // Menandai bahwa pesanan sudah dikirim ke antrean
    console.log("Order succesfully created!")
    // Mendaftarkan penanganan sinyal SIGINT (Ctrl+C) sekali saja
    process.once('SIGINT', async () => { 
        // Mencatat bahwa sinyal diterima
        console.log('got sigint, closing connection');
        // Menutup channel
        await channel.close();
        // Menutup koneksi ke RabbitMQ
        await connection.close(); 
        // Mengakhiri proses dengan kode sukses
        process.exit(0);
    });
};

// Menjalankan server pada port dari environment variable PORT
app.listen(process.env.PORT, () => {
    // Mencatat port yang dipakai server
    console.log(`Server running at ${process.env.PORT}`);
});

