const db = require('../db');  // Impor file koneksi database Anda

// Fungsi untuk mengambil data bunga
exports.getBunga = (req, res) => {
    // Query untuk mengambil semua data bunga
    db.query('SELECT * FROM bunga', (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        // Kirim data bunga ke tampilan
        res.render('katalog', { bunga: results });
    });
};
