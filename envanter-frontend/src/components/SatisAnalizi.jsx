import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';

const SatisAnalizi = () => {
  const [analizData, setAnalizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchAnalizData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/satis-analizi');
      console.log('Gelen veri:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      if (!response.data.satisVerileri || !response.data.analizSonucu) {
        throw new Error('Geçersiz veri formatı');
      }
      
      setAnalizData(response.data);
      setSnackbar({
        open: true,
        message: 'Veriler başarıyla yüklendi',
        severity: 'success'
      });
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError(err.response?.data?.error || err.message || 'Veri yüklenirken bir hata oluştu');
      setSnackbar({
        open: true,
        message: 'Veri yüklenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalizData();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert 
          severity="error" 
          sx={{ width: '100%' }}
          action={
            <button onClick={fetchAnalizData} className="px-4 py-2 bg-red-500 text-white rounded">
              Yeniden Dene
            </button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!analizData?.satisVerileri?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="info" sx={{ width: '100%' }}>
          Henüz satış verisi bulunmamaktadır.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Satış Analizi ve Fiyat Önerileri
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ürün Modeli</TableCell>
              <TableCell align="right">Mevcut Normal Fiyat</TableCell>
              <TableCell align="right">Mevcut İndirimli Fiyat</TableCell>
              <TableCell align="right">Önerilen Fiyat</TableCell>
              <TableCell>Analiz Sonucu</TableCell>
              <TableCell align="right">Satış Adedi</TableCell>
              <TableCell align="right">Satış Süresi (Gün)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analizData?.analizSonucu?.map((urun, index) => {
              const satisVerisi = analizData.satisVerileri.find(
                v => v.urun_modeli === urun.urun_modeli
              );
              
              return (
                <TableRow key={index} hover>
                  <TableCell>{urun.urun_modeli}</TableCell>
                  <TableCell align="right">
                    {Number(urun.mevcut_normal_fiyat).toLocaleString('tr-TR')} ₺
                  </TableCell>
                  <TableCell align="right">
                    {Number(urun.mevcut_indirimli_fiyat).toLocaleString('tr-TR')} ₺
                  </TableCell>
                  <TableCell align="right" 
                    sx={{ 
                      color: urun.onerilen_fiyat < urun.mevcut_indirimli_fiyat ? 'red' : 'green',
                      fontWeight: 'bold'
                    }}
                  >
                    {Number(urun.onerilen_fiyat).toLocaleString('tr-TR')} ₺
                  </TableCell>
                  <TableCell>{urun.analiz_sonucu}</TableCell>
                  <TableCell align="right">
                    {Number(satisVerisi?.satis_adedi || 0).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell align="right">
                    {satisVerisi?.satis_suresi ? 
                      `${satisVerisi.satis_suresi} gün` : 
                      '-'
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SatisAnalizi; 