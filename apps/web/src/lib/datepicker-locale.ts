import { registerLocale } from "react-datepicker";
import { es } from 'date-fns/locale';

export const setupDatePickerLocale = () => {
  registerLocale('es', es);
};