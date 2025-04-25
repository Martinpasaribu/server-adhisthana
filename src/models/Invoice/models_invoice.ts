

export interface Invoice {
  status: boolean | null | string;
  id: string | null;
  id_Product: string | null;
  subject: string | null;
  note: string | null;
  code: string | null;
  less: number;
  timePaid: number;
  createAt: number;
}
