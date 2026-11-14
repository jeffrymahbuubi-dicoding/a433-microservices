// Memuat isi file .env (PORT dan AMQP_URL) ke process.env; variabel yang sudah diatur di Deployment tidak ditimpa
require('dotenv').config()

// Mengimpor framework Express untuk membuat web server
const express = require("express");
// Membuat instance aplikasi Express
const app = express();

// Mengimpor body-parser (dari starter; tidak dipakai oleh service ini)
const bp = require("body-parser");

// Mengimpor amqplib, library klien untuk RabbitMQ (protokol AMQP)
const amqp = require("amqplib");
// Alamat RabbitMQ dibaca dari environment variable AMQP_URL
const amqpServer = process.env.AMQP_URL;
// Variabel untuk menyimpan channel dan connection setelah terhubung
var channel, connection;

// Memanggil fungsi yang terhubung ke RabbitMQ dan mulai menerima pesan
connectToQueue();

// Fungsi asinkron untuk terhubung ke RabbitMQ dan menjadi consumer antrean
async function connectToQueue() {
    // Semua langkah di bawah ditangkap bila gagal (aplikasi tetap berjalan tanpa consumer)
    try {
        // Membuka koneksi ke RabbitMQ
        connection = await amqp.connect(amqpServer);
        // Membuat channel di atas koneksi tersebut
        channel = await connection.createChannel();
        // Memastikan antrean "order" ada; dibuat bila belum ada
        await channel.assertQueue("order");
        // Mendaftarkan consumer: fungsi ini dipanggil untuk setiap pesan dari antrean "order"
        channel.consume("order", data => {
            // Menampilkan isi pesan (pesanan) ke log
            console.log(`Order received: ${Buffer.from(data.content)}`);
            // Menandai bahwa pesanan akan segera dikirim
            console.log("** Will be shipped soon! **\n")
            // Mengirim ack ke RabbitMQ agar pesan dihapus dari antrean
            channel.ack(data);
        });
    // Bila terjadi error pada langkah di atas
    } catch (ex) {
        // Mencatat error ke log
        console.error(ex);
    }
}

// Menjalankan server pada port dari environment variable PORT
app.listen(process.env.PORT, () => {
    // Mencatat port yang dipakai server
    console.log(`Server running at ${process.env.PORT}`);
});
