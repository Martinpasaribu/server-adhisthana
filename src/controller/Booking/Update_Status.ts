
import crypto from 'crypto'
import { TransactionModel } from '../../models/Booking/models_transaksi'
import { CANCELED, PAID, PENDING_PAYMENT } from '../../utils/constant'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY

export  const updateStatusBaseOnMidtransResponse = async ( transaction_id : any , data : any ) => {

    console.log(
        ' oder_id : ', transaction_id,
        'data_status : ', data.status_code,
        'data gross amount : ', data.gross_amount,
        'midtrans_key : ', MIDTRANS_SERVER_KEY
    )
    const hash = crypto.createHash('sha512').update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`).digest('hex')

    if(data.signature_key !== hash) {
        return {
            status: "error",
            message:" invalid signature Key"
        }
    }

    let responseData = null;
    let transactionStatus = data.transaction_status;
    let fraudStatus = data.fraud_status;


    if ( transactionStatus == 'capture') {
        if (fraudStatus == 'accept'){

            const transaction = await TransactionModel.updateOne({transaction_id ,  status: PAID,  payment_methode : data.payment_type });
            responseData = transaction;

        }
    } else if ( transactionStatus == 'settlement'){

        const transaction = await TransactionModel.updateOne({transaction_id ,  status: PAID,  payment_methode : data.payment_type });
        responseData = transaction;


    } else if ( transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){

        const transaction = await TransactionModel.updateOne({transaction_id ,  status: CANCELED });
        responseData = transaction;

        
    } else if ( transactionStatus == 'pending '){

        const transaction = await TransactionModel.updateOne({transaction_id ,  status: PENDING_PAYMENT });
        responseData = transaction;

    }

    return {
        status : 'success',
        data : responseData
    }
}
