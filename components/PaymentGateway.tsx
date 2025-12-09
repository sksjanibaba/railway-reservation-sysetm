import React, { useState, useEffect } from 'react';
import { QrCode, CreditCard, Smartphone, CheckCircle, Lock } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onPaymentSuccess, onBack }) => {
  const [method, setMethod] = useState<'QR' | 'UPI' | 'CARD'>('QR');
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess();
    }, 2500); // Simulate API call
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
           <div>
             <h2 className="text-lg font-medium opacity-80">Payment Gateway</h2>
             <div className="text-3xl font-bold mt-1">₹{amount.toFixed(2)}</div>
           </div>
           <Lock className="w-8 h-8 opacity-50" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setMethod('QR')}
            className={`flex-1 py-4 text-sm font-semibold flex flex-col items-center gap-2 ${method === 'QR' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <QrCode className="w-5 h-5" /> QR Code
          </button>
          <button 
            onClick={() => setMethod('UPI')}
            className={`flex-1 py-4 text-sm font-semibold flex flex-col items-center gap-2 ${method === 'UPI' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Smartphone className="w-5 h-5" /> UPI ID
          </button>
          <button 
            onClick={() => setMethod('CARD')}
            className={`flex-1 py-4 text-sm font-semibold flex flex-col items-center gap-2 ${method === 'CARD' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CreditCard className="w-5 h-5" /> Card
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          {processing ? (
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-slate-800">Processing Payment...</h3>
              <p className="text-slate-500 mt-2">Please do not close this window.</p>
            </div>
          ) : (
            <>
              {method === 'QR' && (
                <div className="text-center">
                   <p className="text-slate-600 mb-4">Scan with any UPI App</p>
                   <div className="bg-white border-2 border-slate-800 p-2 inline-block rounded-lg mb-4">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=railconnect@upi&pn=RailConnect&am=${amount}&cu=INR`} 
                       alt="Payment QR" 
                       className="w-40 h-40"
                     />
                   </div>
                   <p className="text-xs text-slate-400">QR Code expires in 05:00</p>
                   <button onClick={handlePayment} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all">
                     I have paid
                   </button>
                </div>
              )}

              {method === 'UPI' && (
                <div className="space-y-4">
                   <label className="block text-sm font-medium text-slate-700">Enter your UPI ID</label>
                   <input type="text" placeholder="example@okhdfcbank" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all">
                     Verify & Pay
                   </button>
                </div>
              )}

              {method === 'CARD' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVV</label>
                      <input type="password" placeholder="123" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all mt-4">
                     Pay ₹{amount.toFixed(2)}
                  </button>
                </div>
              )}

              <button onClick={onBack} className="w-full mt-4 text-slate-500 hover:text-slate-700 text-sm font-medium">
                Cancel Transaction
              </button>
            </>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t">
          Secured by RailConnect 256-bit Encryption
        </div>
      </div>
    </div>
  );
};
