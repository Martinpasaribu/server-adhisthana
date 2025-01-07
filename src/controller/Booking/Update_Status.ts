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

    // Pemerikasaan room pada data transaksi
    const formattedTransactionId = data.order_id.replace(/^order-/, '');

    const RoomFromTransactionModel = await TransactionModel.find({ bookingId: formattedTransactionId });

    if (!RoomFromTransactionModel || RoomFromTransactionModel.length === 0) {
        throw new Error('RoomFromTransactionModel is empty or not found.');
    }
    
    const products = RoomFromTransactionModel.flatMap((transaction: any) => transaction.products || []);
    
    if (!products || products.length === 0) {
        throw new Error('No products found in RoomFromTransactionModel');
    }


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
                
                // if success payment save data room will pay
                await ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: formattedTransactionId,
                    userId: data.userId, 
                    status: PAID,
                    checkIn: data.checkIn,
                    checkOut: data.checkOut,
                    products: products.map((product: { roomId: string; price: number; quantity: number; name: string }) => ({
                        roomId: product.roomId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name,
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
                // if success payment save data room will pay
                await ShortAvailableController.addBookedRoomForAvailable({
                    transactionId: formattedTransactionId,
                    userId: data.userId, 
                    status: PAID,
                    checkIn: data.checkIn,
                    checkOut: data.checkOut,
                    products: products.map((product: { roomId: string; price: number; quantity: number; name: string }) => ({
                        roomId: product.roomId,
                        price: product.price,
                        quantity: product.quantity,
                        name: product.name,
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
