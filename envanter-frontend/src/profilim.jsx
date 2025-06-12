import React from 'react';
import { Page } from "./components/layout/page";

const Profilim = () => {
  return (
    <Page>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Profilim</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Kullanıcı Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="Aleyna" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soyad</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="Yılmaz" disabled/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="aleynayilmaz@depostok.com" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="+90 555 123 45 67" disabled/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profil Fotoğrafı</label>
                <input type="file" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Çalıştığı Depo & Pozisyonu</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="Merkez Depo / Depo Yöneticisi" disabled />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Güvenlik Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Şifre Değiştirme</label>
                <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Yeni Şifre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">İki Faktörlü Kimlik Doğrulama (2FA)</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option>E-posta</option>
                  <option>SMS</option>
                  <option>Authenticator Uygulaması</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Son Giriş Geçmişi</label>
                <div className="mt-1 text-sm text-gray-700">
                  <p>IP Adresi: 192.168.1.1</p>
                  <p>Tarih: 2025-02-15 14:30</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bağlı Cihazlar & Aktif Oturumlar</label>
                <div className="mt-1 text-sm text-gray-700">
                  <p>Windows 10 - Chrome</p>
                  <button className="mt-2 text-sm text-red-600">Çıkış Yap</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Profilim;
