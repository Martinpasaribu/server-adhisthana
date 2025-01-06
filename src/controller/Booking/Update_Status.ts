import crypto from 'crypto';
import { TransactionModel } from '../../models/Booking/models_transaksi';
import { CANCELED, PAID, PENDING_PAYMENT } from '../../utils/constant';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

export const updateStatusBaseOnMidtransResponse = async (transaction_id : any, data : any) => {
   
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
                        ? data.va_numbers.map((va_number: { va_number: any; bank: any; }) => ({
                              va_number: va_number.va_number,
                              bank: va_number.bank,
                          }))
                        : [],
                        bank: data.bank,
                        card_type: data.card_type
                    }
                );
            }
            break;

        case 'settlement':
            responseData = await TransactionModel.updateOne(
                { bookingId: formattedTransactionId },
                { 
                    status: PAID, 
                    payment_type: data.payment_type,
                    va_numbers: data.va_numbers
                    ? data.va_numbers.map((va_number: { va_number: any; bank: any; }) => ({
                          va_number: va_number.va_number,
                          bank: va_number.bank,
                      }))
                    : [],
                    bank: data.bank,
                    card_type: data.card_type
                
                }
            );
            break;

        case 'cancel':
        case 'deny':
        case 'expire':
            responseData = await TransactionModel.updateOne(
                { bookingId: formattedTransactionId },
                { status: CANCELED }
            );
            break;

        case 'pending':
            responseData = await TransactionModel.updateOne(
                { bookingId: formattedTransactionId },
                { status: PENDING_PAYMENT }
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
