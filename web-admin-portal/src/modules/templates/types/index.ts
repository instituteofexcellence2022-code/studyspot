export interface Template {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'email';
  content: string;
}

export default {};

