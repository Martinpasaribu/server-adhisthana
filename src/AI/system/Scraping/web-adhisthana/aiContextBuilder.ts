// services/aiContextBuilder.ts
import { VillaData, comprehensiveScrape } from './advancedScrapingService';
import { cacheService } from './cacheService';

const CACHE_KEY = 'comprehensive_villa_data';
const CACHE_TTL = 30 * 60 * 1000; // 30 menit

export async function buildAIContext(): Promise<string> {
  // Try to get cached data first
  let villaData = cacheService.get<VillaData>(CACHE_KEY);
  
  if (!villaData) {
    console.log('Cache miss, performing comprehensive scraping...');
    try {
      villaData = await comprehensiveScrape();
      cacheService.set(CACHE_KEY, villaData, CACHE_TTL);
    } catch (error) {
      console.error('Comprehensive scraping failed, using fallback context');
      return getFallbackContext();
    }
  }

  return formatDataForAI(villaData);
}

function formatDataForAI(data: VillaData): string {
  const context = `
# INFORMASI KOMPREHENSIF ADHISTHANA VILLAS & RESORT
*Data diperbarui: ${data.lastUpdated.toLocaleString('id-ID')}*

## INFORMASI DASAR
- **Nama**: ${data.basicInfo.name}
- **Lokasi**: ${data.basicInfo.location}
- **Deskripsi**: ${data.basicInfo.description}

## KONTAK
- **Telepon**: ${data.basicInfo.contact.phone}
- **Email**: ${data.basicInfo.contact.email}
- **Website**: ${data.basicInfo.contact.website}

## DAFTAR VILLA
${data.villas.map((villa, index) => `
### ${villa.name}
- **Harga**: ${villa.price}
- **Kapasitas**: ${villa.capacity}
- **Fitur**: ${villa.features.join(', ')}
- **Deskripsi**: ${villa.description}
`).join('\n')}

## FASILITAS
${data.facilities.map(facility => `- ${facility}`).join('\n')}

## PROMO SAAT INI
${data.promos.length > 0 
  ? data.promos.map(promo => `
### ${promo.title}
- **Deskripsi**: ${promo.description}
- **Periode**: ${promo.validity}
- **Syarat**: ${promo.terms}
`).join('\n')
  : 'Tidak ada promo khusus saat ini. Silakan hubungi WhatsApp untuk penawaran terbaik.'
}

## EVENT TERDEKAT
${data.events.length > 0
  ? data.events.map(event => `
### ${event.title}
- **Tanggal**: ${event.date}
- **Lokasi**: ${event.location}
- **Deskripsi**: ${event.description}
`).join('\n')
  : 'Tidak ada event khusus saat ini.'
}

## TESTIMONI GUEST
${data.testimonials.map(testimonial => `
- **${testimonial.author}** (${'⭐'.repeat(testimonial.rating)}): "${testimonial.comment}" - ${testimonial.date}
`).join('\n')}

## INSTRUKSI KHUSUS UNTUK AI:
1. GUNAKAN BAHASA INDONESIA dengan nuansa Jawa halus (kromo inggil)
2. Selalu sapa dengan "Monggo" atau "Sugeng rawuh"  
3. Berikan informasi yang akurat berdasarkan data di atas
4. Jika ada pertanyaan di luar data ini, arahkan ke kontak yang tersedia
5. Untuk booking, selalu arahkan ke WhatsApp ${data.basicInfo.contact.phone}

**CATATAN**: Data di atas adalah informasi real-time dari website. Jika ada perbedaan, informasi di website adalah yang paling akurat.
`;

  return context;
}

function getFallbackContext(): string {
  return `
# INFORMASI ADHISTHANA VILLAS & RESORT

## INFORMASI DASAR
- **Nama**: Adhisthana Villas & Resort
- **Lokasi**: Kawasan Borobudur, Magelang, Jawa Tengah
- **Deskripsi**: Villa mewah dengan pemandangan eksklusif di kawasan Borobudur

## KONTAK
- **Telepon**: 081111177199
- **Email**: info@adhisthanavillas.com
- **Website**: https://adhisthanavillas.com

## VILLA
1. Villa Joglo Atas: Rp 4.950.000/malam (2 kamar, private pool, view sawah & Merapi)
2. Villa Joglo Bawah: Rp 5.300.000/malam (2 kamar, private pool lebih luas)
3. Villa Kandang: Rp 6.800.000/malam (3 kamar, private pool besar, view terbaik)
4. Villa Omah Putih: Rp 3.800.000/malam (1 kamar, romantic, private pool)
5. Villa Omah Kayu: Rp 3.500.000/malam (1 kamar, konsep glamping mewah)

## FASILITAS
- Private pool di setiap villa
- Floating breakfast atau prasmanan
- Butler pribadi 07.00–22.00
- Shuttle gratis ke Candi Borobudur
- Welcome drink + buah segar

## INSTRUKSI UNTUK AI:
Gunakan bahasa Indonesia yang halus dan ramah. Arahkan ke website untuk informasi terbaru.
`;
}