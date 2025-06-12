import { DataGrid } from "@mui/x-data-grid";
import { Page } from "./components/layout/page";
import Paper from "@mui/material/Paper";
import { Eklesil } from "./components/layout/eklesil";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { GuncelleEkran } from "./components/envanter-ekranlari/guncelle-ekran";
import { CikisYap } from "./components/envanter-ekranlari/cikis-yap.jsx";

export function Envanter() {
  // Genel veriler (back-end'den gelen)
  const [anaKategoriler, setAnaKategoriler] = useState([]);
  const [urunler, setUrunler] = useState([]);
  const [anaKategori, setAnaKategori] = useState(null);
  const [altKategoriler, setAltKategoriler] = useState([]);
  const [secilmisAltKategori, setSecilmisAltKategori] = useState(null);
  const [urunTurleri, setUrunTurleri] = useState([]);
  const [secilmisUrunTuru, setSecilmisUrunTuru] = useState(null);
  const [guncelleModalAcik, setGuncelleModalAcik] = useState(false);
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [modalDurumu, setModalDurumu] = useState(false);

  function guncelleModaliniAc(urun) {
    setSeciliUrun(urun);
    setGuncelleModalAcik(true);
  }

const refreshData = async () => {
  if (secilmisAltKategori && secilmisUrunTuru) {
    const updatedData = await urunleriGetir(
      secilmisAltKategori.id,
      secilmisUrunTuru.urun_turu
    );
    setUrunler(updatedData); // Gelen veriyi state'e doğrudan atıyoruz
  }
};

  useEffect(() => {
    anaKategorileriGetir();
  }, []);

  useEffect(() => {
    if (secilmisAltKategori) {
      urunTurleriniGetir(secilmisAltKategori.id);
    }
  }, [secilmisAltKategori]);

  useEffect(() => {
    if (secilmisUrunTuru) {
      urunleriGetir(secilmisAltKategori.id, secilmisUrunTuru.urun_turu);
    }
  }, [secilmisUrunTuru]);

  async function urunTurleriniGetir(altKategoriId) {
    const cevap = await axios.get("http://localhost:3000/urun-turleri", {
      params: {
        altKategoriId,
      },
    });

    setUrunTurleri(cevap.data);
  }

  function anaKategoriSeç(kategori) {
    setAnaKategori(kategori);
    setAltKategoriler(kategori.AltKategori);
  }

  async function anaKategorileriGetir() {
    const cevap = await axios.get("http://localhost:3000/anakategoriler");

    setAnaKategoriler(cevap.data);
  }

  async function urunleriGetir(altKategoriId, urunTuru) {
    const cevap = await axios.get("http://localhost:3000/urun-modelleri", {
      params: {
        altKategoriId,
        urunTuru,
      },
    });

    setUrunler(cevap.data); // Bu zaten mevcut
    return cevap.data; // Bu eklenmeli
  }

  async function urunSil(urunId) {
    const cevap = await axios.delete(`http://localhost:3000/urunsil`, {
      data: {
        id: urunId,
      },
    });

    setUrunler((prevUrunler) =>
      prevUrunler.filter((urun) => urun.id !== urunId)
    );
  }

  function formatISODateToMMDDYYYY(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  const columns = [
    {
      field: "urun_modeli",
      headerName: "Ürün Modeli",
      type: "string",
      width: 110,
    },
    {
      field: "normal_fiyat",
      headerName: "Normal Fiyat",
      type: "number",
      width: 110,
    },
    {
      field: "indirimli_fiyat",
      headerName: "İndirimli Fiyat",
      type: "number",
      width: 130,
    },
    {
      field: "stok_adedi",
      headerName: "Stok Adedi",
      type: "number",
      width: 130,
    },
    {
      field: "indirim_satis_adedi",
      headerName: "İndirimli Satış Adedi",
      type: "number",
      width: 170,
    },
    {
      field: "normal_satis_adedi",
      headerName: "Normal Satış Adedi",
      type: "number",
      width: 170,
    },
    {
      field: "stok_giris_tarihi",
      headerName: "Stok Giriş Tarihi",
      width: 170,
      renderCell: (params) => {
        return formatISODateToMMDDYYYY(params.value);
      },
    },
    {
      field: "stok_cikis_tarihi",
      headerName: "Stok Çıkış Tarihi",
      width: 170,
      renderCell: (params) => {
        return formatISODateToMMDDYYYY(params.value);
      },
    },
    {
      field: "odeme_yontemi",
      headerName: "Ödeme Yöntemi",
      flex: 1,
      width: 150,
      renderCell: (params) => {
        const odemeYontemi =
          Array.isArray(params.row.Satis) && params.row.Satis.length > 0
            ? params.row.Satis[0].odeme
            : null;

        return odemeYontemi ? odemeYontemi : "Belirtilmemiş";
      },
    },
    {
      headerName: "İşlemler",
      type: "actions",
      width: 200,
      renderCell: (params) => {
        const urunId = params.row.id;

        return (
          <div className="flex gap-4">
            <button
              onClick={() => guncelleModaliniAc(params.row)}
              style={{
                display: "flex", // Flexbox ile hizalama
                alignItems: "center", // Yatayda ortalama
                gap: "8px", // İkon ile yazı arasında boşluk
              }}
            >
              <svg
                className="size-4 fill-white-900 md-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z" />
              </svg>
              <span>Güncelle</span>
            </button>
            <GuncelleEkran
              modalDurumu={guncelleModalAcik}
              setModalDurumu={setGuncelleModalAcik}
              seciliUrun={seciliUrun}
              refreshData={refreshData}
            />

            <button
              onClick={() => {
                urunSil(urunId);
              }}
              style={{
                display: "flex", // Flexbox ile hizalama
                alignItems: "center", // Yatayda ortalama
                gap: "8px", // İkon ile yazı arasında boşluk
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="size-4 fill-white-900 md-4"
              >
                <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
              </svg>
              Sil
            </button>
          </div>
        );
      },
    },
  ];
  const paginationModel = { page: 0, pageSize: 20 };

  return (
    <Page>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Envanter Yönetimi
        </h2>
        <div className="flex gap-4">
          <FormControl fullWidth className="bg-gray-50 rounded-lg">
            <InputLabel shrink>Ana Kategori</InputLabel>
            <Select
              value={anaKategori}
              onChange={(e) => anaKategoriSeç(e.target.value)}
              className="rounded-lg"
              displayEmpty
              notched
              label="Ana Kategori"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiSelect-select": {
                  paddingTop: "16px", 
                  paddingBottom: "8px"
                }
              }}
            >
              {anaKategoriler.map((_anaKategori) => (
                <MenuItem key={_anaKategori.id} value={_anaKategori}>
                  {_anaKategori.kategori_adi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className="bg-gray-50 rounded-lg">
            <InputLabel shrink>Alt Kategori</InputLabel>
            <Select
              value={secilmisAltKategori}
              onChange={(e) => setSecilmisAltKategori(e.target.value)}
              className="rounded-lg"
              displayEmpty
              notched
              label="Alt Kategori"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiSelect-select": {
                  paddingTop: "16px", 
                  paddingBottom: "8px"
                }
              }}
            >
              {altKategoriler.map((_altKategori) => (
                <MenuItem key={_altKategori.id} value={_altKategori}>
                  {_altKategori.kategori_adi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className="bg-gray-50 rounded-lg">
            <InputLabel shrink>Ürün Türü</InputLabel>
            <Select
              value={secilmisUrunTuru}
              onChange={(e) => setSecilmisUrunTuru(e.target.value)}
              className="rounded-lg"
              displayEmpty
              notched
              label="Ürün Türü"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiSelect-select": {
                  paddingTop: "16px", 
                  paddingBottom: "8px"
                }
              }}
            >
              {urunTurleri.map((_urunTuru) => (
                <MenuItem key={_urunTuru.id} value={_urunTuru}>
                  {_urunTuru.urun_turu}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex gap-4">
            <button
              onClick={refreshData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"
                />
              </svg>
              Yenile
            </button>
          </div>
        </div>
      </div>
      <Paper
        className="rounded-lg overflow-hidden shadow-lg"
        sx={{ height: 543, width: "570" }}
      >
        {urunler.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <span className="text-gray-600 text-lg">
              Lütfen Ürün Türü Seçimi Yapınız
            </span>
          </div>
        ) : (
          <DataGrid
            key={urunler.length} // Her veri değişiminde yeniden render
            rows={urunler}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSize={20}
            pageSizeOptions={[20]}
            checkboxSelection
            disableSelectionOnClick
            getRowClassName={(params) => {
              // Stok adedi 50'nin altındaysa satırı kırmızı yap
              return params.row.stok_adedi < 50 ? "stok-az" : "";
            }}
            getRowHeight={() => "auto"} // Satır yüksekliğini otomatik ayarla
            sx={{
              border: 0,
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f0f0f0",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f8fafc",
              },
            }}
          />
        )}
      </Paper>
      <Eklesil />
      <CikisYap
        refreshData={refreshData}
        modalDurumu={modalDurumu}
        setModalDurumu={setModalDurumu}
      />
      <style>{`
        .stok-az {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
        }
        .Mui-selected {
          background-color: #dbeafe !important;
          color: #3b82f6 !important;
        }
        .action-button {
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .update-button {
          background-color: #3b82f6;
          color: white;
        }
        .update-button:hover {
          background-color: #2563eb;
        }
        .delete-button {
          background-color: #ef4444;
          color: white;
        }
        .delete-button:hover {
          background-color: #dc2626;
        }
      `}</style>
    </Page>
  );
}

export default Envanter;
