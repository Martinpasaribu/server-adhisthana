
import { Request, Response, NextFunction  } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { TransactionModel } from '../../../models/Transaction/models_transaksi';
import { ShortAvailableController } from '../../ShortAvailable/controller_short';
import { PAID, PAID_ADMIN, PAYMENT_ADMIN } from '../../../constant';
import { BookingModel } from '../../../models/Booking/models_booking';
import crypto from 'crypto';
import { Invoice } from '../../../models/Invoice/models_invoice';
import { time } from 'console';
import { RoomStatusModel } from '../../../models/RoomStatus/models_RoomStatus';

export class RoomStatusController {

  

}