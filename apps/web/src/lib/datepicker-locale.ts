import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

export const setupDatePickerLocale = () => {
  registerLocale('es', es);
};