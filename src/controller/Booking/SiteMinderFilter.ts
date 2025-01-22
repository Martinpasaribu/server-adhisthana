import moment from 'moment';
import { SiteMinderModel } from '../../models/SiteMinder/models_SitemMinder';


export const FilterSiteMinder = async (checkIn : any, checkOut:any) => {

    const dateMinderStart = moment.utc(checkIn).format('YYYY-MM-DD'); 
    const dateMinderEnd = moment.utc(checkOut).subtract(1, 'days').format('YYYY-MM-DD'); 


    const siteMinders = await SiteMinderModel.find({
        isDeleted: false,
        date: { $gte: dateMinderStart, $lte: dateMinderEnd }, 
    });



    if (!siteMinders || siteMinders.length === 0) {
        throw new Error("Tidak ada data SiteMinder yang ditemukan untuk tanggal tersebut.");
    }

    return siteMinders ;

}