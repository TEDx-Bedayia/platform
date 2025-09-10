export type Applicant = {
  full_name: string;
  email: string;
  ticket_type: string;
  payment_method: string;
  created_at: string;
  paid: boolean;
  admitted_at: string | null;
  id: number;
  sent: boolean;
  phone: string;
  uuid?: string;
};
