import React, { useState } from 'react';
import { User, Mail, Phone, Ticket as TicketIcon, Plus, Trash2 } from 'lucide-react';
import { Train, SeatAvailability, Passenger } from '../types';

interface BookingFormProps {
  train: Train;
  selectedClass: SeatAvailability;
  travelDate: string;
  onProceed: (passengers: Passenger[]) => void;
  onBack: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ train, selectedClass, travelDate, onProceed, onBack }) => {
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: 0, gender: 'Male', mobile: '', email: '' }
  ]);
  const [contactMobile, setContactMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([...passengers, { name: '', age: 0, gender: 'Male', mobile: '', email: '' }]);
    }
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      const newPassengers = [...passengers];
      newPassengers.splice(index, 1);
      setPassengers(newPassengers);
    }
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: any) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (passengers.some(p => !p.name || p.age <= 0)) {
      alert("Please fill in all passenger details correctly.");
      return;
    }
    if (!contactMobile || !contactEmail) {
      alert("Please provide contact details.");
      return;
    }

    // Embed contact info into all passengers so the data is consistent in the database
    const finalPassengers = passengers.map((p) => ({ 
      ...p, 
      mobile: contactMobile, 
      email: contactEmail 
    }));

    onProceed(finalPassengers);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold">{train.trainName} ({train.trainNumber})</h2>
             <div className="flex gap-4 mt-2 text-blue-100">
               <span>{train.source} → {train.destination}</span>
               <span>•</span>
               <span>{travelDate}</span>
               <span>•</span>
               <span className="font-semibold text-white bg-blue-500/50 px-2 py-0.5 rounded">{selectedClass.type}</span>
             </div>
           </div>
           <div className="text-right">
             <div className="text-3xl font-bold">₹{selectedClass.price * passengers.length}</div>
             <div className="text-sm opacity-80">Total Fare</div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Passenger Details
          </h3>

          <div className="space-y-6">
            {passengers.map((passenger, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-slate-700">Passenger {index + 1}</span>
                  {passengers.length > 1 && (
                    <button type="button" onClick={() => removePassenger(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={passenger.name}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={passenger.age || ''}
                      onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPassenger}
            className="mt-4 flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Passenger
          </button>

          <hr className="my-8 border-slate-200" />

          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TicketIcon className="w-6 h-6 text-blue-600" />
            Contact Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="ticket@railconnect.com"
                />
                <p className="text-xs text-slate-500 mt-1">Ticket details will be sent to this email.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button
              type="button"
              onClick={onBack}
              className="w-1/3 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};