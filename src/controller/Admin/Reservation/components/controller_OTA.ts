
class OTA_Service {
    // Fungsi untuk mencampur data OTA ke dalam ProductFilter
    async Mix_OTA(Product: any, ProductFilter: any) {
      ProductFilter.forEach((item: any) => {
        if (item.roomId === Product.roomId) {
          // Menambahkan atau mengubah value sesuai kebutuhan
          Object.assign(item, Product);
        }
      });
    }
  }
  

  export const OTAService = new OTA_Service();
  