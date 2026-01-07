import mongoose, { Schema, Document } from "mongoose";

interface Video {
  url :string;
  orientation: string;
}

export interface IPromo extends Document {

  _id: mongoose.Types.ObjectId;
  secret_key: string
  title: string;
  type: 'ROM' | 'HLD' | 'DSC' | 'VCR'
  type_claim: "WA" | "WEB" | "WAW";
  room_key:mongoose.Types.ObjectId;
  user_key: string [];
  desc: string;
  sub_desc: string;
  image: string;
  backgroundImage: string;
  video: Video ;

  // 💰 Pengaturan promo
  code: string; // contoh: "HOLIDAY50"
  discountType: "percentage" | "fixed"; // Jenis diskon
  discountValue: number; // Nilai diskon (misal 20 = 20% atau 50000 = Rp50.000)
  maxDiscount?: number; // Batas maksimal potongan (kalau diskon persentase)
  minTransaction?: number; // Transaksi minimum agar promo berlaku

  // 🎯 Validasi waktu & batas
  startDate: Date;
  endDate: Date;

  startDateVoucher: Date;
  endDateVoucher: Date;

  usageLimit?: number; // Maksimal total penggunaan promo
  perUserLimit?: number; // Maksimal 1 user bisa pakai berapa kali
  usedCount: number; // Jumlah pemakaian sejauh ini

  // 🔐 Kontrol status
  isActive: boolean;
  isPublic: boolean; // true = bisa digunakan siapa pun, false = hanya user tertentu
  applicableRooms?: string[]; // daftar id room yang promo berlaku (opsional)
  applicableUserIds?: string[]; // jika promo eksklusif untuk user tertentu
  createdBy?: mongoose.Types.ObjectId; // siapa yang buat promo (admin id)
  
  createdAt: Date;
  updatedAt: Date;

  isDeleted: boolean
}

const PromoSchema = new Schema<IPromo>(
  {
    secret_key : { type: String, required: true, default: null, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ["ROM", "HLD", "DSC", "VCR"] },
    type_claim: { type: String, required: true, enum: ["WA", "WEB", "WAW"] },
    room_key:  { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
    user_key: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    image: { type: String, required: false },
    backgroundImage: { type: String, required: false },
    video: { 
      url : { type: String, required: false, default : "" },
      orientation : { type: String, required: false, default : "" }
     },
    desc: { type: String, required: true },
    sub_desc: { type: String, required: true },

    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: null },
    minTransaction: { type: Number, default: 0 },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startDateVoucher: { type: Date, required: true },
    endDateVoucher: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    applicableRooms: [{ type: String }],
    applicableUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            
    isDeleted: {
            type: Boolean,
            default: false  
        },

  },
  { timestamps: true }
);

// ✅ Middleware: auto-nonaktifkan promo jika sudah kadaluarsa
PromoSchema.pre("save", function (next) {
  if (this.endDate < new Date()) {
    this.isActive = false;
  }
  next();
});

export const PromoModel = mongoose.model<IPromo>('Promo', PromoSchema,'Promo');



// | Field               | Fungsi                                                                                |
// | ------------------- | ------------------------------------------------------------------------------------- |
// | **title**           | Judul promo, misalnya “Promo Akhir Tahun”                                             |
// | **type**            | Jenis promo — hanya bisa salah satu dari: `"ROM"`, `"HLD"`, `"DISCOUNT"`, `"VOUCHER"` |
// | **room_key**        | Relasi ke data **Room** (misalnya promo berlaku untuk kamar tertentu)                 |
// | **image**           | Gambar utama promo (misalnya banner kecil)                                            |
// | **backgroundImage** | Gambar latar belakang untuk tampilan besar/banner hero                                |
// | **desc**            | Deskripsi utama promo                                                                 |
// | **sub_desc**        | Deskripsi tambahan atau penjelasan singkat promo                                      |


// | Field              | Fungsi                                                                                                    |
// | ------------------ | --------------------------------------------------------------------------------------------------------- |
// | **code**           | Kode promo unik (misalnya `SAVOY2025`), otomatis diubah ke huruf besar dan di-trim (hapus spasi berlebih) |
// | **discountType**   | Jenis diskon — `"percentage"` (persentase) atau `"fixed"` (potongan nominal)                              |
// | **discountValue**  | Nilai diskon — bisa berupa angka persen atau nilai tetap (contoh: `10` atau `50000`)                      |
// | **maxDiscount**    | Batas maksimum potongan jika menggunakan persentase (contoh: maksimal potongan Rp50.000)                  |
// | **minTransaction** | Nilai minimal transaksi agar promo bisa digunakan (contoh: minimal Rp200.000)                             |

// | Field            | Fungsi                                                                  |
// | ---------------- | ----------------------------------------------------------------------- |
// | **startDate**    | Tanggal mulai promo                                                     |
// | **endDate**      | Tanggal berakhir promo                                                  |
// | **usageLimit**   | Jumlah total penggunaan promo (contoh: 100 kali total untuk semua user) |
// | **perUserLimit** | Batas pemakaian promo per user (contoh: 1 kali per user)                |
// | **usedCount**    | Jumlah penggunaan promo yang sudah tercatat                             |

// | Field                 | Fungsi                                                                        |
// | --------------------- | ----------------------------------------------------------------------------- |
// | **isActive**          | Menandakan apakah promo sedang aktif atau tidak                               |
// | **isPublic**          | Menentukan apakah promo ditampilkan untuk semua user atau hanya user tertentu |
// | **applicableRooms**   | Daftar ID kamar (atau kategori kamar) yang promo-nya berlaku                  |
// | **applicableUserIds** | Daftar user yang promo-nya berlaku (relasi ke `User`)                         |
// | **createdBy**         | ID admin yang membuat promo (relasi ke `Admin`)                               |
// | **isDeleted**         | Untuk soft delete (promo dihapus tapi datanya tetap tersimpan di DB)          |

// | Field                | Fungsi                                                                   |
// | -------------------- | ------------------------------------------------------------------------ |
// | **timestamps: true** | Menambahkan otomatis field `createdAt` dan `updatedAt` di setiap dokumen |
