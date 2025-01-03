
export interface createTransaction {
    bookingId:string;
    status:string;
    grossAmount:number;
    
    products: { 
        roomId: string, 
        quantity: number,
        price: number,
      }[];

    userId:string;
    paymentUrl: string;                    
    checkIn: string;
    checkOut: string;
    snap_token: string;
}

export default interface createTransactionItem {
    transactionId: string;
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
}
export default interface updateTransactionStatus {
    transactionId:string;
    status:string;
}

export default interface updateTransactionStatus {
    transactionId:string;
    status:string;
}


export interface createTransactionBooking {

    orderId: string;
    checkIn: string;
    checkOut: string;
    adult: number;
    children: number;
    amountTotal: number;
    amountBefDisc: number;
    couponId: string;
    idUser: string;
    creatorId: string;
    rooms: { roomId: string; quantity: number }[];

}