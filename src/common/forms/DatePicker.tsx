'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { Input } from '@/primitives/input';
import { Button } from '@/primitives/button';

interface Props {
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePicker({ value, onChange, error, placeholder, minDate, maxDate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [inputValue, setInputValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value);
      setDisplayDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    // Try to parse the date
    const date = new Date(inputVal);
    if (!isNaN(date.getTime()) && inputVal.length >= 8) {
      onChange(inputVal);
      setDisplayDate(date);
    }
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setInputValue(dateString);
    onChange(dateString);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const renderCalendar = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = value && date.toISOString().split('T')[0] === value;
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={i}
          onClick={() => !isDisabled && handleDateSelect(date)}
          disabled={isDisabled}
          className={`
            w-8 h-8 text-sm rounded-md transition-colors
            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
            ${isToday ? 'bg-blue-100 text-blue-900' : ''}
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
            ${isSelected && !isDisabled ? 'hover:bg-blue-700' : ''}
          `}
        >
          {date.getDate()}
        </button>
      );

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || 'YYYY-MM-DD'}
          className={error ? 'border-red-500' : ''}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <Button
              plain
              onClick={() => navigateMonth('prev')}
              className="p-1"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <div className="font-medium">
              {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
            </div>
            
            <Button
              plain
              onClick={() => navigateMonth('next')}
              className="p-1"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center p-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between">
            <Button
              plain
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setInputValue(today);
                onChange(today);
                setIsOpen(false);
              }}
            >
              Today
            </Button>
            
            <Button
              plain
              onClick={() => {
                setInputValue('');
                onChange('');
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 