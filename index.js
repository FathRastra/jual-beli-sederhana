const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/toko_online', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produk ORDER BY kode_produk');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ pesan: 'Gagal mengambil data' });
  }
});

app.post('/api/toko_online', async (req, res) => {
  const { kode_produk, nama_produk, harga, stok } = req.body;
  if (!kode_produk || !nama_produk || harga == null || stok == null)
    return res.status(400).json({ pesan: 'Isi semua kolom' });
  try {
    await db.execute(
      'INSERT INTO produk (kode_produk,nama_produk,harga,stok) VALUES (?,?,?,?)',
      [kode_produk, nama_produk, harga, stok]
    );
    res.status(201).json({ pesan: 'Data ditambahkan' });
  } catch (err) {
    res.status(400).json({ pesan: 'Kode produk sudah ada / data salah' });
  }
});

app.put('/api/toko_online/:kode', async (req, res) => {
  const { nama_produk, harga, stok } = req.body;
  if (!nama_produk || harga == null || stok == null)
    return res.status(400).json({ pesan: 'Isi semua kolom' });
  try {
    const [hasil] = await db.execute(
      'UPDATE produk SET nama_produk=?,harga=?,stok=? WHERE kode_produk=?',
      [nama_produk, harga, stok, req.params.kode]
    );
    if (!hasil.affectedRows)
      return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
    res.json({ pesan: 'Data diperbarui' });
  } catch (err) {
    res.status(500).json({ pesan: 'Gagal memperbarui data' });
  }
});

app.delete('/api/toko_online/:kode', async (req, res) => {
  try {
    const [hasil] = await db.execute(
      'DELETE FROM produk WHERE kode_produk=?',
      [req.params.kode]
    );
    if (!hasil.affectedRows)
      return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
    res.json({ pesan: 'Data dihapus' });
  } catch (err) {
    res.status(500).json({ pesan: 'Gagal menghapus data' });
  }
});

app.listen(3000, () => console.log('Port 3000 aktif'));