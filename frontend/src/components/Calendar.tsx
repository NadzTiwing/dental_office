import { useState } from "react";
import { DentistData } from "../services/types";

interface CalendarProps {
  selectedDentist: string;
  dentists: DentistData[];
  onDateSelect: (date: string) => void;
}

export default function Calendar({ selectedDentist, dentists, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Start from tomorrow
  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3)); // 3 months from now

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    if (newDate <= maxDate) {
      setCurrentDate(newDate);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDentistAvailable = (date: Date) => {
    if (!selectedDentist) return false;

    const dentist = dentists.find(d => d.id.toString() === selectedDentist);
    if (!dentist) return false;

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return dentist.availability.some(avail => avail.dayOfWeek === dayOfWeek);
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({
        date,
        isCurrentMonth: true,
        isAvailable: isDentistAvailable(date)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: false
      });
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDateClick = (date: Date) => {
    if (!isDentistAvailable(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    onDateSelect(dateString);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="flex flex-col">
        <div className="mt-4">
          <div className="flex items-center justify-between text-gray-900">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={currentDate < minDate}
              className={`p-2 rounded-none ${currentDate < minDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <span className="sr-only">Previous month</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm sm:text-base font-semibold">
                {formatDate(currentDate)}
              </div>
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              disabled={currentDate.getMonth() === maxDate.getMonth() && currentDate.getFullYear() === maxDate.getFullYear()}
              className={`p-2 rounded-none ${currentDate.getMonth() === maxDate.getMonth() && currentDate.getFullYear() === maxDate.getFullYear() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <span className="sr-only">Next month</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 text-xs leading-6 text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-medium text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-px bg-gray-200 text-sm shadow ring-1 ring-gray-200">
            {generateCalendarDays().map((day) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              const dateString = day.date.toISOString().split('T')[0];
              const isPastDate = day.date < minDate;
              const isFutureYear = day.date > maxDate;
              const isSelected = dateString === selectedDate;
              
              return (
                <button
                  key={dateString}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  disabled={isPastDate || isFutureYear || !day.isAvailable || isToday}
                  className={`
                    relative w-full py-2 sm:py-3 focus:z-10
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isPastDate || isFutureYear || !day.isAvailable || isToday ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                    ${isToday ? 'font-semibold text-gray-400' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isSelected ? 'border-blue-500' : ''}
                  `}
                >
                  <time
                    dateTime={dateString}
                    className={`mx-auto flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-none ${isSelected ? 'text-blue-700' : ''}`}
                  >
                    {day.date.getDate()}
                  </time>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
