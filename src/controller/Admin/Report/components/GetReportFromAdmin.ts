// Model: BookingModel

import ReportDailyModel, { IReportDaily } from "../../../../models/Report/models_reportDaily"


export interface IReportDailyInput {
  title: string;
  content: string;
  category: string;
  creator: string;
}


export async function GetReportFromAdmin({title, content, category, creator }: IReportDailyInput ) {


  try {

    const result = await ReportDailyModel.create({title, content, category, creator});


    return result

  } catch (error) {
    console.error('Failed to create Daily Report:', error)
    throw error
  }
}
