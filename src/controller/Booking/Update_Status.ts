import crypto from 'crypto';
import { TransactionModel } from '../../models/Transaction/models_transaksi';
import { CANCELED, PAID, PENDING_PAYMENT } from '../../utils/constant';
import { RoomController } from '../Room/controller_room';
import { ShortAvailableController } from '../ShortAvailable/controller_short';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

export const updateStatusBaseOnMidtransResponse = async (transaction_id : any, data : any, res:any) => {
   
    console.log(
        'order_id:', transaction_id,
        'data_status:', data.status_code,
        'transaction_status:', data.transaction_status,
        'data gross amount:', data.gross_amount,
        'midtrans_key:', MIDTRANS_SERVER_KEY,
        'payment_type :', data.payment_type,
        'va_numbers :', data.va_numbers,
        'bank :', data.bank,
        'card_type :', data.card_type,
        " Data yang akan dimasukan ke short : ", data
        
    );

    // Generate signature hash
    const hash = crypto
        .createHash('sha512')
        .update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex');

    if (data.signature_key !== hash) {
        return {
            status: 'error',
            message: 'Invalid signature key',
        };
    }

    const formattedTransactionId = data.order_id.replace(/^order-/, '');

    let responseData = null;

    switch (data.transaction_status) {
        case 'capture':
            if (data.fraud_status === 'accept') {
                responseData = await TransactionModel.updateOne(
                    { bookingId: formattedTransactionId },
                    { 
                        status: PAID, 
                        payment_type: data.payment_type,
                        va_numbers: data.va_numbers
                        ? data.va_numbers.map((va_number: { va_number: string; bank: string; }) => ({
                              va_number: va_number.va_number,
                              bank: va_number.bank,
                          }))
                        : [],
                        bank: data.bank,
                        card_type: data.card_type
                    }
                );
                
                console.log(" Data yang akan dimasukan ke short : ", data)
                // if success payment save data room will pay
                await ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: formattedTransactionId,
                    userId: data.userId, // Ganti sesuai dengan data yang relevan
                    roomId : data.products?.find((key: any) => key.roomId)?.roomId || 'defaultRoomId',
                    status: PAID,
                    checkIn: data.checkIn, // Pastikan data ini tersedia
                    checkOut: data.checkOut, // Pastikan data ini tersedia
                    products: data.products?.map((products : { roomId: string; price: number, quantity:number, name:string}) => ({
                        roomId: products.roomId,
                        price: products.price,
                        quantity: products.quantity,
                        name: products.name
                })),
                }, res);
            }
            break;

        case 'settlement':
            responseData = await TransactionModel.updateOne(
                { bookingId: formattedTransactionId },
                { 
                    status: PAID, 
                    payment_type: data.payment_type,
                    va_numbers: data.va_numbers
                    ? data.va_numbers.map((va_number: { va_number: string; bank: string; }) => ({
                          va_number: va_number.va_number,
                          bank: va_number.bank,
                      }))
                    : [],
                    bank: data.bank,
                    card_type: data.card_type
                
                }
            );
                console.log(" Data yang akan dimasukan ke short : ", data)
                // if success payment save data room will pay
                await ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: formattedTransactionId,
                    userId: data.userId, // Ganti sesuai dengan data yang relevan
                    roomId : data.products?.find((key: any) => key.roomId)?.roomId || 'defaultRoomId',
                    status: PAID,
                    checkIn: data.checkIn, // Pastikan data ini tersedia
                    checkOut: data.checkOut, // Pastikan data ini tersedia
                    products: data.products?.map((products : { roomId: string; price: number, quantity:number, name:string}) => ({
                        roomId: products.roomId,
                        price: products.price,
                        quantity: products.quantity,
                        name: products.name
                })),
                }, res);

            break;

        case 'cancel':
        case 'deny':
        case 'expire':
            responseData = await TransactionModel.updateOne(
                { bookingId: formattedTransactionId },
                { 
                    status: CANCELED,
                    payment_type: data.payment_type,
                    va_numbers: data.va_numbers
                    ? data.va_numbers.map((va_number: { va_number: string; bank: string; }) => ({
                          va_number: va_number.va_number,
                          bank: va_number.bank,
                      }))
                    : [],
                    bank: data.bank,
                    card_type: data.card_type
                 }
            );
            break;

        case 'pending':
            responseData = await TransactionModel.updateOne(
                { bookingId: formattedTransactionId },
                { 
                    status: PENDING_PAYMENT,
                                    payment_type: data.payment_type,
                    va_numbers: data.va_numbers
                    ? data.va_numbers.map((va_number: { va_number: string; bank: string; }) => ({
                          va_number: va_number.va_number,
                          bank: va_number.bank,
                      }))
                    : [],
                    bank: data.bank,
                    card_type: data.card_type
                }
            );
            break;

        default:
            console.warn('Unhandled transaction status:', data.transaction_status);
    }

    return {
        status: 'success',
        data: responseData,
        message: 'Transaction status has been updated!',
    };
};
