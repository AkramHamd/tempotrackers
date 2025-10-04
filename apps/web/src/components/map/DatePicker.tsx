'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface DatePickerProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export default function DatePicker({ onDateSelect, selectedDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onDateSelect(date);
  };

  return (
    <div className="relative">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Prediction Date:</label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            className="p-1 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
