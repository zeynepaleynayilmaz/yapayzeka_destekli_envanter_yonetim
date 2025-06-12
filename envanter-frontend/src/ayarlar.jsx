import React from 'react';
import { Page } from "./components/layout/page";

export function Ayarlar() {
  return (
    <Page>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sistem Ayarları</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Genel Ayarlar */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Genel Ayarlar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Şirket Adı</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="DepoStok" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Varsayılan Para Birimi</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="TRY">TRY - Türk Lirası</option>
                  <option value="USD">USD - Amerikan Doları</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Saat Dilimi</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Envanter Ayarları */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Envanter Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Stok Uyarı Seviyesi</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stok Sayım Periyodu (Gün)</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Barkod Formatı</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="EAN13">EAN-13</option>
                  <option value="CODE128">Code 128</option>
                  <option value="QR">QR Code</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bildirim Ayarları */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Bildirim Ayarları</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 shadow-sm" defaultChecked />
                <label className="ml-2 block text-sm text-gray-700">Düşük Stok Bildirimleri</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 shadow-sm" defaultChecked />
                <label className="ml-2 block text-sm text-gray-700">Son Kullanma Tarihi Bildirimleri</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 shadow-sm" defaultChecked />
                <label className="ml-2 block text-sm text-gray-700">Sipariş Bildirimleri</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bildirim E-posta Adresleri</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="ornek@depostok.com" />
              </div>
            </div>
          </div>

          {/* Kullanıcı ve Güvenlik */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Kullanıcı ve Güvenlik</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Oturum Zaman Aşımı (Dakika)</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Şifre Politikası</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="normal">Normal</option>
                  <option value="strong">Güçlü</option>
                  <option value="very-strong">Çok Güçlü</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 shadow-sm" defaultChecked />
                <label className="ml-2 block text-sm text-gray-700">İki Faktörlü Doğrulama</label>
              </div>
            </div>
          </div>

          {/* Raporlama Ayarları */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Raporlama Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Otomatik Rapor Oluşturma</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                  <option value="monthly">Aylık</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rapor Formatı</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 shadow-sm" defaultChecked />
                <label className="ml-2 block text-sm text-gray-700">Otomatik E-posta Gönderimi</label>
              </div>
            </div>
          </div>

          {/* Entegrasyon Ayarları */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Entegrasyon Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">E-Fatura Entegrasyonu</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="disabled">Devre Dışı</option>
                  <option value="enabled">Etkin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Muhasebe Yazılımı</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="none">Seçilmedi</option>
                  <option value="logo">Logo</option>
                  <option value="mikro">Mikro</option>
                  <option value="nebim">Nebim</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 shadow-sm" />
                <label className="ml-2 block text-sm text-gray-700">Otomatik Veri Senkronizasyonu</label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Vazgeç
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            Kaydet
          </button>
        </div>
      </div>
    </Page>
  );
}
