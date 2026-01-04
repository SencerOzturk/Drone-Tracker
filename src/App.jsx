
/* İlk olarak gerekli dosyalarımı parçalara ayırıp ayrı ayrı import ederek modüler bir yapı oluşturuyorum. */
import React, { useMemo, useState } from 'react' /* useState;Durum hesaplamalarını,bileşen içindeki veriyi hatırlamayı ve bilgi değişikliklerini ekranda guncellemesini yonetmek için kullanılır.useMemo ise veri degismedigi muddetce yenıden hesaplama yapmamızı onleyerek performans saglar. */
import { FiMapPin, FiActivity, FiRefreshCw } from 'react-icons/fi' /* React-icons kutuphanesınden ikonlar seçtim. */
import MapView from './components/MapView.jsx' /* Drone'ların konumlarını gosteren dosyayı getiriyor. */
import DroneList from './components/DroneList.jsx' /* Sol kısıma Drone listesi getirilmesi için çağrıldı. */
import DetailsPanel from './components/DetailsPanel.jsx' /* Sağdaki detay paneli. */
import { useLiveDrones } from './hooks/useLiveDrones.js' /*Drone verilerini,çekme,yenileme,seçili drone'u bulma gibi tum karmasık işlemleri baska bir dosyaya yazdım ve onun icindeki useLiveDrones adındaki fonksıyonu (bir parçasını) import ettim. */

export default function App() { // Export,bu component'in baska dosyada calısmasını sağlar.Default ise bu dosyanın varsayılan çıktısı demek ve App adında bir component (fonksiyon
// ) tanımlıyoruz.

  // JavaScript Kodları,return içinde kullanılmak adına buraya yazılır.
  const { drones, paths, refresh, isRefreshing, setSelectedId, selectedId, selectedDrone } = useLiveDrones() // useLiveDrones bir nesne döndürdü ve bu nesne içindeki parçaları değişken gibi isimlendirdik.

  const [query, setQuery] = useState('')  // Arama kısmının ılk degerı yazıldı ve query aranan yazı ve bu yazı ile ilgili kısım setQuery fonksıyonu cagrılarak guncellendı,set edildi.

  const [status, setStatus] = useState('all') // Burası da seçme işlemi değiştiğindeki set edilme kısmı.


  
  const filtered = useMemo(() => { // Filtered adında bir değişken olusturuyoruz ve asagıdakı işlemleri yaparken gereksız hesaplamaları onleyen useMemo'yu atıyoruz.

    const q = query.trim().toLowerCase() // yazılan metni (query) basındakı ve sonundakı boslukları silip,hepsını kucuk harfe cevırıp q degıskenıne atıyoruz.

    // Şimdi aranan drone listede var mı/yok mu kontrolu yapacagız.
    return drones.filter(d => { // return drones ile drone'ların dizisinin geri dondur ve her bir elemanı d ile isimlendirip bu metodun kuralları (yani asagıda tanımlanan kurala gore) ile uygun mu degıl mı dıye bak.Burası bir metod'dur.
      
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) // q! ile boşsa butun drone'ları gonder 1 olur sonuc diğeri ise dizi elemanı olan d'yi kucuk harflere cevır ardından içinde q'de yazan bir şey var mı diye bak.Diğeri ise id'ye (dizideki drone'un kısa tanımlaması) gore arama yapar.

      const matchS = status === 'all' || d.status === status // drone'un durumu all secılıyse hepsını getır degılse aranan drone'nun durumu dizideki haliyle uyusuyor mu diye bak.

      return matchQ && matchS // Aranan drone dizide aranan drone'mu kontrolu true/false doner.
    })
  }, [drones, query, status]) // AMA SADECE: drones, query, status DEĞİŞTİĞİNDE YENİDEN HESAPLA yoksa onceki degerleri kullan.


  // Burası da HTML kısmının yazıldığı ve yukarıdaki js kodlarının,metodlarının kullanıldığı yer.Js kodları kullanılırken {} parantezi kullanılır.
  return (
    
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <FiMapPin size={18} /> 
          <span>Drone Tracker</span>
        </div>
        <div className="header-actions">
          <button onClick={refresh} disabled={isRefreshing}> 
            <FiRefreshCw style={{ marginRight: 6 }} /> Yenile 
          </button>
          <button className="primary">
            <FiActivity style={{ marginRight: 6 }} /> Yeni Uçuş 
          </button>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <div className="section-header">
            <strong>Filtreler</strong>
          </div>
          <div className="controls">
            <input className="input" placeholder="Ara: ID, ad" value={query} onChange={e => setQuery(e.target.value)} /> 
          </div>

          <div className="filters">
            <select className="select" value={status} onChange={e => setStatus(e.target.value)}> 
              <option value="all">Tümü</option> 
              <option value="online">Aktif</option>
              <option value="idle">Beklemede</option>
              <option value="alert">Uyarı</option>
            </select>
            <select className="select" onChange={e => e.target.value}>
              <option>Filtre 2</option> 
            </select>
          </div>
        
          <DroneList drones={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        <section className="content">
          <MapView drones={filtered} paths={paths} selectedId={selectedId} onSelect={setSelectedId} />
        </section>

        <aside className="details">
          <div className="section-header">
            <strong>Detaylar</strong>
          </div>
          <DetailsPanel drone={selectedDrone} />
        </aside>
      </main>
    </div>
  )
}