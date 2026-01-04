/*
  Bu dosyada React root'unu oluşturuyoruz. React önce kendi Virtual DOM'unda
  `App.jsx` bileşenini hesaplar, ardından `index.html` içindeki `#root` öğesine yazar.
  Burası tüm uygulamanın başlangıç noktasıdır ve global CSS de burada başlatılır.
*/
import React from 'react' /* react kutuphanesını dahil ettik.  */
import { createRoot } from 'react-dom/client' /* react-dom kutuphanesının client kısmına git ve creatroot fonksıyonu ile reat-root olustur. */
import App from './App.jsx' /* Ana uygulama bileşenini içe aktarır.*/
import './styles.css'
import 'leaflet/dist/leaflet.css' /* Harita kutuphanemiz olan Leaflet'in css dosyası import edildi. */

const container = document.getElementById('root') /*root id'li div kutusunu bulur.*/
const root = createRoot(container) /* React root'unu o id'ye yerlestirdik. */
root.render( /* root içerisine ana uygulama dosyamızı import ettik. */
  <React.StrictMode>
    <App />
  </React.StrictMode>
)