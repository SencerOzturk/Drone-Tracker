# 🏠 Home Altitude (Referans Noktası) Açıklaması

## 📍 Referans Noktası Nedir?

**Home Altitude**, telefonunuzdan ilk GPS verisi geldiğinde o konumun yüksekliğidir. Bu nokta, tüm sonraki irtifa hesaplamalarının referansı olarak kullanılır.

## 🔄 Nasıl Belirlenir?

### Senaryo 1: Cihazdan Altitude Geliyorsa
```
1. İlk GPS verisi gelir (örnek: 41.0082, 28.9784)
2. Cihazdan altitude bilgisi gelir (örnek: 150 m)
3. Home Altitude = 150 m olarak kaydedilir
4. Relative Altitude = 0 m (çünkü home point'teyiz)
```

### Senaryo 2: Cihazdan Altitude Gelmiyorsa
```
1. İlk GPS verisi gelir (örnek: 41.0082, 28.9784)
2. Cihazdan altitude gelmez (null)
3. GPS koordinatlarından OpenElevation API ile yükseklik hesaplanır
   (örnek: Deniz seviyesinden 120 m yükseklik)
4. Home Altitude = 120 m olarak kaydedilir
5. Relative Altitude = 0 m (çünkü home point'teyiz)
```

### Senaryo 3: API Başarısız Olursa
```
1. İlk GPS verisi gelir
2. Cihazdan altitude gelmez
3. GPS API çağrısı başarısız olur
4. Home Altitude = 0 m olarak varsayılan değer kullanılır
```

## 📊 Örnek Senaryo

### Başlangıç (Home Point)
- **Konum:** İstanbul, Kadıköy (41.0082, 28.9784)
- **Home Altitude:** 120 m (deniz seviyesinden)
- **Absolute Altitude:** 120 m
- **Relative Altitude:** 0 m (home point'teyiz)

### Hareket Sonrası
- **Yeni Konum:** İstanbul, Üsküdar (41.0214, 29.0123)
- **Absolute Altitude:** 150 m (deniz seviyesinden)
- **Home Altitude:** 120 m (değişmez!)
- **Relative Altitude:** +30 m (home point'e göre 30 m yukarıda)

### Daha Yüksek Bir Yere Çıkarsanız
- **Yeni Konum:** İstanbul, Çamlıca Tepesi (41.0356, 29.0234)
- **Absolute Altitude:** 250 m (deniz seviyesinden)
- **Home Altitude:** 120 m (hala değişmez!)
- **Relative Altitude:** +130 m (home point'e göre 130 m yukarıda)

## 🎯 Önemli Noktalar

1. **Home Altitude Değişmez:** İlk GPS verisi geldiğinde belirlenir ve sonraki tüm hesaplamalarda sabit kalır.

2. **Relative Altitude:** Home point'e göre ne kadar yukarıda/aşağıda olduğunuzu gösterir.
   - Pozitif değer = Home point'ten yukarıda
   - Negatif değer = Home point'ten aşağıda
   - 0 = Home point'te

3. **Absolute Altitude:** Deniz seviyesinden (veya GPS API'nin referans aldığı seviyeden) yükseklik.

4. **Yeni Uçuş Başlatma:** Eğer yeni bir uçuş başlatmak isterseniz, home point sıfırlanmalıdır (şu an manuel olarak yapılmalı, gelecekte otomatik yapılabilir).

## 🔧 Teknik Detaylar

- **Home Point Belirleme:** `backend/src/services/telemetryCalculator.js` dosyasında `calculateAltitude` fonksiyonu içinde yapılır.
- **GPS API:** OpenElevation API kullanılarak GPS koordinatlarından yükseklik hesaplanır.
- **Saklama:** Her drone için home altitude, `previousTelemetryMap` içinde saklanır.

## 💡 Kullanım Senaryosu

Gerçek drone uçuşlarında:
- **Takeoff (Kalkış):** Home point, drone'un kalktığı yer olarak belirlenir
- **Flight (Uçuş):** Relative altitude, drone'un home point'e göre ne kadar yükseldiğini/alçaldığını gösterir
- **Landing (İniş):** Relative altitude genellikle 0'a yakın olur (home point'e dönüş)

Bu sistem, gerçek drone telemetri sistemlerine benzer şekilde çalışır.

