import React, { useState } from 'react';
import { Ticket } from '../types';
import { CheckCircle, XCircle, Home, Printer, TrainFront, Loader2 } from 'lucide-react';

interface TicketViewProps {
  ticket: Ticket;
  onHome: () => void;
  onCancelTicket: (pnr: string) => Promise<void>;
}

export const TicketView: React.FC<TicketViewProps> = ({ ticket, onHome, onCancelTicket }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    setIsCancelling(true);
    try {
      await onCancelTicket(ticket.pnr);
      setShowCancelModal(false);
    } catch (error) {
      alert("Failed to cancel ticket. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in pb-20">
      
      {/* Success/Status Banner */}
      <div className={`rounded-xl p-6 mb-8 text-center shadow-lg ${ticket.bookingStatus === 'CONFIRMED' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
        <div className="flex justify-center mb-4">
          {ticket.bookingStatus === 'CONFIRMED' ? <CheckCircle className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {ticket.bookingStatus === 'CONFIRMED' ? 'Booking Confirmed!' : 'Ticket Cancelled'}
        </h1>
        <p className="opacity-90 text-lg">
          {ticket.bookingStatus === 'CONFIRMED' 
            ? 'Your journey is scheduled. Have a safe trip!' 
            : 'Your ticket has been cancelled successfully. Refund initiated.'}
        </p>
      </div>

      {/* Ticket Card */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden relative">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <TrainFront className="w-96 h-96" />
        </div>

        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <span className="font-bold tracking-widest text-lg">RAILCONNECT E-TICKET</span>
          <span className="text-sm opacity-70">PNR: {ticket.pnr}</span>
        </div>

        <div className="p-8 space-y-8 relative z-10">
          
          {/* Train Info */}
          <div className="flex flex-col md:flex-row justify-between border-b border-dashed border-slate-300 pb-6">
            <div>
              <div className="text-sm text-slate-500 font-semibold uppercase mb-1">Train</div>
              <div className="text-2xl font-bold text-slate-800">{ticket.train.trainName}</div>
              <div className="text-slate-600">#{ticket.train.trainNumber}</div>
            </div>
            <div className="mt-4 md:mt-0 md:text-right">
              <div className="text-sm text-slate-500 font-semibold uppercase mb-1">Class</div>
              <div className="text-2xl font-bold text-slate-800">{ticket.selectedClass.type.split('(')[1].replace(')', '')}</div>
              <div className="text-slate-600">Quota: GENERAL</div>
            </div>
          </div>

          {/* Journey Info */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold text-slate-800">{ticket.train.departureTime}</div>
              <div className="text-sm font-semibold text-slate-500 uppercase">{ticket.train.source}</div>
              <div className="text-xs text-slate-400 mt-1">{ticket.date}</div>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="text-xs text-slate-400 mb-1">{ticket.train.duration}</div>
              <div className="w-32 h-0.5 bg-slate-300 relative">
                <div className="absolute -top-1.5 right-0 w-3 h-3 bg-slate-400 rounded-full"></div>
                <div className="absolute -top-1.5 left-0 w-3 h-3 bg-slate-400 rounded-full"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-800">{ticket.train.arrivalTime}</div>
              <div className="text-sm font-semibold text-slate-500 uppercase">{ticket.train.destination}</div>
              <div className="text-xs text-slate-400 mt-1">{ticket.date}</div>
            </div>
          </div>

          {/* Passenger Table */}
          <div>
            <div className="text-sm text-slate-500 font-semibold uppercase mb-3">Passengers</div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-slate-600 font-medium">Name</th>
                    <th className="px-4 py-2 text-slate-600 font-medium">Age/Gender</th>
                    <th className="px-4 py-2 text-slate-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ticket.passengers.map((p, i) => (
                    <tr key={i} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600">{p.age} / {p.gender[0]}</td>
                      <td className={`px-4 py-3 font-bold ${ticket.bookingStatus === 'CANCELLED' ? 'text-red-500' : 'text-green-600'}`}>
                        {ticket.bookingStatus === 'CANCELLED' ? 'CANCELLED' : `CNF / S3 / ${24 + i}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-100">
             <div>
                <div className="text-xs text-slate-400">Transaction ID</div>
                <div className="text-sm font-mono text-slate-600">TXN{Math.floor(Math.random() * 10000000)}</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-slate-400">Total Amount</div>
                <div className="text-2xl font-bold text-slate-900">₹{ticket.totalAmount}</div>
             </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
        <button 
          onClick={onHome}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          <Home className="w-5 h-5" /> Back to Home
        </button>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
          <Printer className="w-5 h-5" /> Print Ticket
        </button>
        
        {ticket.bookingStatus === 'CONFIRMED' && (
          <button 
            onClick={() => setShowCancelModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel Ticket
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Ticket?</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to cancel this booking? A cancellation charge of ₹240 will apply.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
              >
                No, Keep it
              </button>
              <button 
                onClick={handleCancelClick}
                disabled={isCancelling}
                className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex justify-center"
              >
                {isCancelling ? <Loader2 className="animate-spin w-5 h-5" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};