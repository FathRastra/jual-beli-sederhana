const API = '/api/toko_online';
const $ = id => document.getElementById(id);
let kodeEdit = null;
 
const form = $('formProduk');
const tabel = $('dataProduk');
const pilih = $('pilihProduk');
const pesan = $('pesan');
 
const rupiah = angka => 'Rp' + Number(angka).toLocaleString('id-ID');
 
function tampilPesan(teks) {
  pesan.textContent = teks;
}
 
async function muatData() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Gagal mengambil data');
 
    const data = await res.json();
    tampilkanTabel(data);
    isiPilihan(data);
  } catch (error) {
    tampilPesan(error.message);
  }
}

function tampilkanTabel(data) {
  tabel.replaceChildren();
  data.forEach(p => {
    const tr = document.createElement('tr');
    [p.kode_produk, p.nama_produk, rupiah(p.harga), p.stok].forEach(nilai => {
      const td = document.createElement('td');
      td.textContent = nilai;
      tr.appendChild(td);
    });
 
    const aksi = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => mulaiEdit(p);
 
    const hapus = document.createElement('button');
    hapus.textContent = 'Hapus';
    hapus.onclick = () => hapusData(p.kode_produk);
 
    aksi.append(edit, hapus);
    tr.appendChild(aksi);
    tabel.appendChild(tr);
  });
}
 
async function simpanData(data) {
  try {
    const url = kodeEdit
      ? API + '/' + encodeURIComponent(kodeEdit) : API;
    const res = await fetch(url, {
      method: kodeEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const hasil = await res.json();
    if (!res.ok) throw new Error(hasil.pesan || 'Gagal menyimpan data');
    batalEdit();
    await muatData();
    tampilPesan('Data berhasil disimpan');
  } catch (err) { tampilPesan(err.message); }
}
 
function mulaiEdit(p) {
  kodeEdit = p.kode_produk;
  $('kode').value = p.kode_produk;
  $('kode').disabled = true;
  $('nama').value = p.nama_produk;
  $('harga').value = p.harga;
  $('stok').value = p.stok;
  $('btnSimpan').textContent = 'Perbarui';
}
 
function batalEdit() {
  kodeEdit = null;
  form.reset();
  $('kode').disabled = false;
  $('btnSimpan').textContent = 'Simpan';
}
 
async function hapusData(kode) {
  if (!confirm('Hapus produk ' + kode + '?')) return;
  try {
    const url = API + '/' + encodeURIComponent(kode);
    const res = await fetch(url, { method: 'DELETE' });
    const hasil = await res.json();
    if (!res.ok) throw new Error(hasil.pesan || 'Gagal menghapus');
    if (kodeEdit === kode) batalEdit();
    await muatData();
    tampilPesan('Data berhasil dihapus');
  } catch (err) {
    tampilPesan(err.message);
  }
}
 
function isiPilihan(data) {
  const terpilih = pilih.value;
  pilih.replaceChildren();
  data.forEach(p => {
    const opsi = document.createElement('option');
    opsi.value = p.kode_produk;
    opsi.textContent = p.nama_produk + ' (stok: ' + p.stok + ')';
    pilih.appendChild(opsi);
  });
  if (data.some(p => p.kode_produk === terpilih)) pilih.value = terpilih;
}
 
async function beliProduk() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Gagal mengambil data');
    const data = await res.json();
    const p = data.find(x => x.kode_produk === pilih.value);
    if (!p) throw new Error('Pilih produk terlebih dahulu');
 
    const jumlah = $('jumlah').value === '' ? 1 : Number($('jumlah').value);
    if (!Number.isInteger(jumlah) || jumlah < 1)
      throw new Error('Jumlah harus bilangan bulat minimal 1');
    if (p.stok < jumlah)
      throw new Error('Stok ' + p.nama_produk + ' tidak cukup (sisa ' + p.stok + ')');
 
    const stokBaru = p.stok - jumlah;
    const put = await fetch(API + '/' + encodeURIComponent(p.kode_produk), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_produk: p.nama_produk, harga: p.harga, stok: stokBaru })
    });
    const hasil = await put.json();
    if (!put.ok) throw new Error(hasil.pesan || 'Gagal melakukan transaksi');
 
    $('jumlah').value = '';
    await muatData();
    tampilPesan('Berhasil membeli ' + jumlah + ' ' + p.nama_produk +
      '. Total: ' + rupiah(p.harga * jumlah));
  } catch (err) {
    tampilPesan(err.message);
  }
}
 
form.addEventListener('submit', async (e) => {
  e.preventDefault();
 
  const data = {
    kode_produk: $('kode').value.trim(),
    nama_produk: $('nama').value.trim(),
    harga: parseInt($('harga').value, 10),
    stok: parseInt($('stok').value, 10)
  };
 
  await simpanData(data);
});
 
$('btnBatal').addEventListener('click', batalEdit);
$('btnBeli').addEventListener('click', beliProduk);
muatData();