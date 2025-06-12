import { Page } from "./components/layout/page";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { UrunSec } from './components/envanter-ekranlari/urunsecmodal';
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import CountUp from 'react-countup';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


const YapayZekaPage = () => {
  const [modalDurumu, setModalDurumu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [analizSonucu, setAnalizSonucu] = useState(null);
  const [stokAnalizi, setStokAnalizi] = useState(null);
  const [satisKarsilastirmaAnalizi, setSatisKarsilastirmaAnalizi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toplamStok, setToplamStok] = useState(0);
  const [kategoriAnalizi, setKategoriAnalizi] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [karlilikVerileri, setKarlilikVerileri] = useState(null);
  const [karlilikYukleniyor, setKarlilikYukleniyor] = useState(false);
  const [enCokSatanUrunler, setEnCokSatanUrunler] = useState(null);
  const [enCokSatanYukleniyor, setEnCokSatanYukleniyor] = useState(false);
  const [error, setError] = useState(null);

  const [pieData, setPieData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#2B3467", // Koyu mavi
          "#0000FF", // Mavi
          "#FF00FF", // Pembe
          "#FF6B00", // Turuncu
        ],
        borderWidth: 0,
      },
    ],
  });

  const barData = useMemo(() => {
    if (!karlilikVerileri?.karlilik_analizi) return null;

    return {
      labels: karlilikVerileri.karlilik_analizi.map(urun => urun.urun_modeli),
      datasets: [
        {
          label: 'Karlılık Yüzdesi',
          data: karlilikVerileri.karlilik_analizi.map(urun => urun.karlilik_yuzdesi),
          backgroundColor: [
            '#4F46E5', // Mor
            '#FFB800', // Sarı
            '#FF4444', // Kırmızı
            '#3B82F6', // Mavi
            '#4F46E5', // Mor
            '#FF4444', // Kırmızı
          ],
          borderRadius: 4,
          barThickness: 12,
        },
        {
          label: 'Normal Satış Adedi',
          data: karlilikVerileri.karlilik_analizi.map(urun => urun.normal_satis_adedi),
          hidden: true
        },
        {
          label: 'İndirimli Satış Adedi',
          data: karlilikVerileri.karlilik_analizi.map(urun => urun.indirim_satis_adedi),
          hidden: true
        },
        {
          label: 'Stok Adedi',
          data: karlilikVerileri.karlilik_analizi.map(urun => urun.stok_adedi),
          hidden: true
        }
      ],
    };
  }, [karlilikVerileri]);

  const barOptions = {
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'En Karlı 6 Ürün Analizi',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          afterBody: function(context) {
            if (!karlilikVerileri?.karlilik_analizi) return [];
            
            const analiz = karlilikVerileri.karlilik_analizi[context[0].dataIndex];
            if (!analiz) return [];
            
            return [
              '',
              `Karlılık Durumu: %${analiz.karlilik_yuzdesi}`,
              `Normal Satış Adedi: ${analiz.normal_satis_adedi}`,
              `Normal Satış Fiyatı: ${analiz.normal_fiyat}`,
              `İndirimli Satış Adedi: ${analiz.indirim_satis_adedi}`,
              `İndirimli Satış Fiyatı: ${analiz.indirimli_fiyat}`,
              `Stok Adedi: ${analiz.stok_adedi}`,
              `Risk Faktörü: ${analiz.risk_faktoru}`,
              `Fiyat Önerisi: ${analiz.fiyat_onerisi}`,
              '',
              'Öneriler:',
              ...(analiz.öneriler || []).map(oneri => `- ${oneri}`)
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Kategori Bazında Gelir Dağılımı",
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodySpacing: 4,
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('tr-TR', { 
                style: 'currency', 
                currency: 'TRY',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed);
            }
            return label;
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex;
            const ilgiliKategori = kategoriAnalizi && kategoriAnalizi[dataIndex];
            
            if (ilgiliKategori && ilgiliKategori.öneriler) {
              const oneri = ilgiliKategori.öneriler;
              const parcalanmisOneri = oneri.match(/.{1,40}(\s|$)/g) || [];
              
              return [
                '',
                'Öneri:',
                ...parcalanmisOneri.map(parca => parca.trim())
              ];
            }
            return [];
          }
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  const fetchAnaliz = async () => {
    if (!selectedProduct?.urun_modeli) {
      console.error('Ürün modeli eksik:', selectedProduct);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/satis-analizi', {
        urun_modeli: selectedProduct.urun_modeli
      });

      console.log('Fiyat Analizi API yanıtı:', response.data);

      if (response.data?.durum === "başarılı") {
        setAnalizSonucu(response.data);
      } else {
        throw new Error('Analiz başarısız oldu');
      }
    } catch (error) {
      console.error('Fiyat analizi hatası:', error);
      setAnalizSonucu(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStokAnalizi = async () => {
    if (!selectedProduct?.urun_modeli) {
      console.error('Ürün modeli eksik:', selectedProduct);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/stok-analizi', {
        urun_modeli: selectedProduct.urun_modeli
      });

      console.log('Stok Analizi API yanıtı:', response.data);

      if (response.data?.durum === "başarılı") {
        setStokAnalizi(response.data.analiz);
      } else {
        throw new Error('Stok analizi başarısız oldu');
      }
    } catch (error) {
      console.error('Stok analizi hatası:', error);
      setStokAnalizi(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSatisKarsilastirmaAnalizi = async () => {
    if (!selectedProduct?.urun_modeli) {
      console.error('Ürün modeli eksik:', selectedProduct);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/satis-karsilastirma-analizi', {
        urun_modeli: selectedProduct.urun_modeli
      });

      console.log('Satış Karşılaştırma API yanıtı:', response.data);

      if (response.data?.analiz?.satis_karsilastirmasi) {
        setSatisKarsilastirmaAnalizi(response.data.analiz);
      } else {
        throw new Error('Satış karşılaştırma analizi başarısız oldu');
      }
    } catch (error) {
      console.error('Satış karşılaştırma analizi hatası:', error);
      setSatisKarsilastirmaAnalizi(null);
    } finally {
      setLoading(false);
    }
  };

  // Toplam stok sayısını getiren fonksiyon
  const getToplamStok = async () => {
    try {
      const response = await axios.get('http://localhost:3000/toplam-urun-sayisi');
      setToplamStok(response.data.toplamStok);
    } catch (error) {
      console.error('Toplam stok verisi alınamadı:', error);
    }
  };

  // Component mount olduğunda toplam stok verisini al
  useEffect(() => {
    getToplamStok();
  }, []);

  const fetchKategoriAnalizi = useCallback(async () => {
    setYukleniyor(true);
    setHata(null);
    setKategoriAnalizi(null); // Reset the analysis data when starting a new fetch
    
    try {
      // Endpoint URL'sini v2 olarak güncelle
      const response = await fetch('http://localhost:3000/kategorik-gelir-analizi-v2', {
        method: 'POST', // POST metodu kalabilir, backend'de body kullanılmıyor
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend'den gelen veri (v2):", data);

      // Veri yapısını kontrol et ve Pie chart için işle
      if (data && data.kategori_analizi && Array.isArray(data.kategori_analizi)) {
        setKategoriAnalizi(data.kategori_analizi); // Ham veriyi state'e kaydet (öneriler vs. için)
        
        // Pie chart için veri hazırla
        const labels = data.kategori_analizi.map(item => item.kategori_adi);
        const gelirData = data.kategori_analizi.map(item => item.toplam_gelir);

        setPieData(prevData => ({
          ...prevData,
          labels: labels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: gelirData,
            }
          ]
        }));
      } else {
        console.error("Beklenen veri formatı alınamadı:", data);
        throw new Error("Beklenen veri formatı alınamadı.");
      }

    } catch (error) {
      setHata(error.message);
      console.error("Kategori analizi (v2) veri çekme hatası:", error);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  const fetchKarlilikAnalizi = async () => {
    try {
      setKarlilikYukleniyor(true);
      setKarlilikVerileri(null); // Reset the data when starting a new analysis
      const response = await axios.post('http://localhost:3000/karlilik-analizi');
      console.log('Karlılık analizi yanıtı:', response.data);
      setKarlilikVerileri(response.data);
    } catch (error) {
      console.error('Karlılık analizi verisi alınamadı:', error);
    } finally {
      setKarlilikYukleniyor(false);
    }
  };

  const fetchEnCokSatanUrunler = async () => {
    try {
      setEnCokSatanYukleniyor(true);
      setEnCokSatanUrunler(null); // Reset data when starting a new analysis
      const response = await axios.post('http://localhost:3000/en-cok-satan-urunler');
      
      if (response.data?.detayli_analizler) {
        setEnCokSatanUrunler(response.data);
      } else {
        throw new Error('En çok satan ürünler alınamadı');
      }
    } catch (error) {
      console.error('En çok satan ürünler verisi alınamadı:', error);
    } finally {
      setEnCokSatanYukleniyor(false);
    }
  };

  const handleUrunSecim = (urun) => {
    console.log('Seçilen ürün:', urun);
    if (urun?.urun_modeli) {
      setSelectedProduct(urun);
    } else {
      console.error('Geçersiz ürün seçimi:', urun);
    }
  };

  const handleKartClick = () => {
    if (!selectedProduct) {
      setModalDurumu(true);
    }
  };

  // Ürün seçildiğinde tüm analizleri çağır
  useEffect(() => {
    if (selectedProduct?.urun_modeli) {
      fetchAnaliz();
      fetchStokAnalizi();
      fetchSatisKarsilastirmaAnalizi();
    }
  }, [selectedProduct]);

  const [islemler, setIslemler] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 4; // Her sayfada 6 kayıt

  const fetchIslemler = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/son-islemler?page=${page}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }
      
      const data = await response.json();
      
      // Veri kontrolü yap
      if (!data || !data.islemler) {
        throw new Error('Geçersiz veri formatı');
      }

      setIslemler(data.islemler);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Son işlemler alınamadı:', err);
      setError('Veriler yüklenirken bir hata oluştu');
      setIslemler([]); // Hata durumunda boş dizi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIslemler(currentPage);
    
    const interval = setInterval(() => fetchIslemler(currentPage), 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const CustomPagination = () => {
    return (
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="text-sm text-gray-700">
          {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)} / ${totalPages * itemsPerPage}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded">
            {`${currentPage}`}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Define a component for the "En Çok Satan Ürünler" card to make it clickable
  const EnCokSatanCard = () => (
    <div 
      className={`bg-white rounded-lg p-6 shadow-sm ${!enCokSatanYukleniyor && !enCokSatanUrunler && 'cursor-pointer hover:shadow-md'} transition-shadow`}
      onClick={() => !enCokSatanYukleniyor && !enCokSatanUrunler && fetchEnCokSatanUrunler()}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">En Çok Satan Ürünler</h2>
        {enCokSatanUrunler && !enCokSatanYukleniyor && (
          <div className="flex items-center">
            <div className="text-xs text-green-600 flex items-center mr-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Analiz tamamlandı
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (!enCokSatanYukleniyor) {
                  fetchEnCokSatanUrunler();
                }
              }} 
              className="text-gray-500 hover:text-gray-700"
              title="Analizi yenile"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {enCokSatanYukleniyor ? (
        <div className="flex flex-col justify-center items-center h-52">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      ) : enCokSatanUrunler?.detayli_analizler?.length > 0 ? (
        <div className="space-y-4">
          {enCokSatanUrunler.detayli_analizler.map((urun, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{urun.product_model}</span>
                  <span className={`text-sm ${urun.risk_factor === 'artışta' ? 'text-green-500' : urun.risk_factor === 'azalışta' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {urun.risk_factor === 'artışta' ? '↑' : urun.risk_factor === 'azalışta' ? '↓' : '→'}
                  </span>
                </div>
                <div className="text-gray-500 text-sm">Trend: {urun.risk_factor}</div>
              </div>
              <div className="text-gray-600 text-sm font-medium">{urun.tahmini_satis_adedi} Adet</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          En çok satan ürünler için kartı tıklayın.
        </div>
      )}
    </div>
  );

  return (
    <Page>
      <div className="flex gap-4 mb-6">
        <div
          className="bg-white rounded-lg p-6 shadow-sm flex-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleKartClick}
        >
          <div className="text-gray-500 text-sm">
            {selectedProduct
              ? `${selectedProduct.urun_modeli} Fiyat Analizi`
              : ""}
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Fiyat analizi yapılıyor...</span>
            </div>
          ) : analizSonucu?.analiz?.fiyat_analizi ? (
            <div className="space-y-6">
              <div className="pt-4">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="font-semibold text-lg mb-3 text-blue-900">
                    Optimum Fiyat Önerisi
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    ₺
                    {analizSonucu.analiz.fiyat_analizi.optimum_fiyat_onerisi.toLocaleString(
                      "tr-TR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-8">
              {selectedProduct
                ? "Yükleniyor... Lütfen bekleyiniz."
                : "Fiyat analizi için kartı tıklayın"}
            </div>
          )}
        </div>

        <div
          className="bg-white rounded-lg p-6 shadow-sm flex-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleKartClick}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-500 text-sm">
              {selectedProduct
                ? `${selectedProduct.urun_modeli} Stok Analizi`
                : ""}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Stok analizi yapılıyor...</span>
            </div>
          ) : stokAnalizi?.stok_analizi ? (
            <div className="space-y-4">
              <div>
                <div className="text-gray-600 text-sm">Toplam Stok</div>
                <div className="text-2xl font-semibold">
                  {stokAnalizi.stok_analizi.toplam_stok_adedi.toLocaleString(
                    "tr-TR"
                  )}{" "}
                  adet
                </div>
              </div>

              <div>
                <div className="text-gray-600 text-sm">Stok Devir Hızı</div>
                <div className="text-xl font-medium text-blue-600">
                  {stokAnalizi.stok_analizi.stok_devir_hizi.toFixed(2)}x
                </div>
              </div>

              <div>
                <div className="text-gray-600 text-sm">
                  Optimum Stok Önerisi
                </div>
                <div className="text-lg font-medium text-green-600">
                  {stokAnalizi.stok_analizi.optimum_stok_onerisi.toLocaleString(
                    "tr-TR"
                  )}{" "}
                  adet
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">
              {selectedProduct
                ? "Yükleniyor... Lütfen bekleyiniz."
                : "Stok analizi için kartı tıklayın"}
            </div>
          )}
        </div>

        <div
          className="bg-white rounded-lg p-6 shadow-sm flex-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleKartClick}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-500 text-sm">
              {selectedProduct
                ? `${selectedProduct.urun_modeli} Satış Karşılaştırma`
                : ""}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Satış karşılaştırması yapılıyor...</span>
            </div>
          ) : satisKarsilastirmaAnalizi?.satis_karsilastirmasi ? (
            <div className="space-y-4">
              <div>
                <div className="text-gray-600 text-sm">
                  İndirimli Satış Yüzdesi
                </div>
                <div className="text-2xl font-semibold">
                  %
                  {satisKarsilastirmaAnalizi.satis_karsilastirmasi.indirimli_satis_yuzdesi.toFixed(
                    2
                  )}
                </div>
              </div>

              <div>
                <div className="text-gray-600 text-sm">
                  Normal Satış Yüzdesi
                </div>
                <div className="text-xl font-medium text-blue-600">
                  %
                  {satisKarsilastirmaAnalizi.satis_karsilastirmasi.normal_satis_yuzdesi.toFixed(
                    2
                  )}
                </div>
              </div>

              <div>
                <div className="text-gray-600 text-sm">Karlılık Analizi</div>
                <div className="text-lg font-medium text-green-600">
                  {
                    satisKarsilastirmaAnalizi.satis_karsilastirmasi
                      .karlilik_analizi
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">
              {selectedProduct
                ? "Yükleniyor... Lütfen bekleyiniz."
                : "Satış karşılaştırma analizi için kartı tıklayın"}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div
            className={`bg-white rounded-lg p-6 shadow-sm mb-6 ${!karlilikYukleniyor && !karlilikVerileri && 'cursor-pointer hover:shadow-md'} transition-shadow`}
            onClick={() => !karlilikYukleniyor && !karlilikVerileri && fetchKarlilikAnalizi()}
          >
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-lg font-semibold">Karlılık Analizi</h2>
              {karlilikVerileri && karlilikVerileri.karlilik_analizi && !karlilikYukleniyor && (
                <div className="flex items-center">
                  <div className="text-xs text-green-600 flex items-center mr-2">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Analiz tamamlandı
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!karlilikYukleniyor) {
                        fetchKarlilikAnalizi();
                      }
                    }} 
                    className="text-gray-500 hover:text-gray-700"
                    title="Analizi yenile"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div style={{ height: "400px" }}>
              {karlilikYukleniyor ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p>Veriler yükleniyor...</p>
                </div>
              ) : karlilikVerileri ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-s">
                  <p>Karlılık analizi için kartı tıklayın</p>
                </div>
              )}
            </div>
          </div>

          <div
            className="bg-white rounded-lg p-6 shadow-sm"
            style={{ height: "400px" }}
          >
            <h2 className="text-lg font-semibold mb-4">Son İşlemler</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem Tipi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {islemler.map((islem) => (
                    <tr key={islem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {islem.islemTipi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {islem.aciklama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {islem.urun?.urun_modeli || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(islem.tarih).toLocaleString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sayfalama */}
            <CustomPagination />
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
          style={{ width: "400px", minWidth: "400px" }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg px-6 py-4 text-white shadow-lg"
            style={{ height: "120px" }}
          >
            {/* Animasyonlu arka plan efekti */}
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.2, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full opacity-30 blur-3xl"
              />
            </div>

            {/* İçerik */}
            <div className="relative z-10">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-medium mb-2 text-indigo-100"
              >
                Toplam Stok Adedi
              </motion.div>
              
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold"
                >
                  <CountUp
                    end={toplamStok}
                    duration={2}
                    separator=""
                    className="tabular-nums"
                  />
                </motion.div>
                
                {/* Trend göstergesi */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center text-sm text-indigo-100"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                
                </motion.div>
              </div>

              {/* Alt bilgi */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-indigo-100 mt-2"
              >
              
              </motion.div>
            </div>

            {/* Pulse efekti */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute -bottom-4 -right-4 w-24 h-24 bg-white rounded-full opacity-30 blur-xl"
            />
          </motion.div>
          
          <div
            className={`bg-white rounded-lg p-6 shadow-sm ${!yukleniyor && !kategoriAnalizi && 'cursor-pointer hover:shadow-md'} transition-shadow`}
            onClick={() => !yukleniyor && !kategoriAnalizi && fetchKategoriAnalizi()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Kategori Bazında Gelir Analizi</h2>
              {kategoriAnalizi && !yukleniyor && (
                <div className="flex items-center">
                  <div className="text-xs text-green-600 flex items-center mr-2">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Analiz tamamlandı
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!yukleniyor) {
                        fetchKategoriAnalizi();
                      }
                    }} 
                    className="text-gray-500 hover:text-gray-700"
                    title="Analizi yenile"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div style={{ height: "400px" }}>
              {yukleniyor ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p>Veriler yükleniyor...</p>
                </div>
              ) : pieData?.datasets[0]?.data?.length > 0 ? (
                <div style={{ height: "350px" }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-s">
                  <p>{hata || "Kategori analizi için kartı tıklayın"}</p>
                </div>
              )}
            </div>
          </div>

          <EnCokSatanCard />
        </motion.div>
      </div>

      <UrunSec
        modalDurumu={modalDurumu}
        setModalDurumu={setModalDurumu}
        setSelectedProduct={handleUrunSecim}
      />
    </Page>
  );
};

export default YapayZekaPage; 
