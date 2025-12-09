import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { BookingForm } from './components/BookingForm';
import { PaymentGateway } from './components/PaymentGateway';
import { TicketView } from './components/TicketView';
import { searchTrainsWithGemini } from './services/geminiService';
import { saveBooking, cancelBooking, getUserBookings } from './services/bookingService';
import { supabase } from './services/supabaseClient';
import { User, Train, Passenger, Ticket, SeatAvailability, ViewState } from './types';
import { TrainFront, Calendar, MapPin, Search, ArrowRight, Clock, IndianRupee, LogOut, Loader2, History, Ticket as TicketIcon, ChevronRight } from 'lucide-react';

export default function App() {
  // Global State
  const [view, setView] = useState<ViewState>('AUTH');
  const [user, setUser] = useState<User | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  
  // Search State
  const [source, setSource] = useState('New Delhi');
  const [destination, setDestination] = useState('Mumbai Central');
  const [date, setDate] = useState('2024-06-15');
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Booking Flow State
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedClass, setSelectedClass] = useState<SeatAvailability | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [bookingPassengers, setBookingPassengers] = useState<Passenger[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Ticket[]>([]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0]
        });
        if (view === 'AUTH') setView('SEARCH');
      } else {
        setView('AUTH');
      }
      setAppLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0]
        });
        if (view === 'AUTH') setView('SEARCH');
      } else {
        setUser(null);
        setView('AUTH');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTrains([]);
    setBookingHistory([]);
    setView('AUTH');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!source || !destination || !date) return;
    
    setIsLoading(true);
    setTrains([]); // Clear previous
    setView('RESULTS');
    
    try {
      const results = await searchTrainsWithGemini(source, destination, date);
      setTrains(results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClass = (train: Train, seatClass: SeatAvailability) => {
    if (seatClass.status === 'AVAILABLE' || seatClass.status === 'RAC' || seatClass.status === 'WAITLIST') {
      setSelectedTrain(train);
      setSelectedClass(seatClass);
      setView('BOOKING');
    }
  };

  const handleBookingProceed = (passengers: Passenger[]) => {
    setBookingPassengers(passengers);
    setView('PAYMENT');
  };

  const handlePaymentSuccess = async () => {
    if (!selectedTrain || !selectedClass || !user) return;

    const newTicket: Ticket = {
      pnr: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      train: selectedTrain,
      selectedClass: selectedClass,
      passengers: bookingPassengers,
      date: date,
      bookingStatus: 'CONFIRMED',
      bookingDate: new Date().toISOString(),
      totalAmount: selectedClass.price * bookingPassengers.length
    };

    // Save to Supabase
    try {
      await saveBooking(user.id, newTicket);
    } catch (err) {
      console.warn("Failed to save booking to DB, proceeding with local state", err);
    }

    setCurrentTicket(newTicket);
    setView('TICKET');
  };

  const handleCancelTicket = async (pnr: string) => {
    try {
      await cancelBooking(pnr);
      // Update local state if currently viewing ticket
      if (currentTicket && currentTicket.pnr === pnr) {
        setCurrentTicket({ ...currentTicket, bookingStatus: 'CANCELLED' });
      }
      // Update history list if it exists
      setBookingHistory(prev => prev.map(t => t.pnr === pnr ? { ...t, bookingStatus: 'CANCELLED' } : t));
    } catch (error) {
      console.error("Cancellation failed", error);
      throw error;
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    setView('HISTORY');
    try {
      const bookings = await getUserBookings(user.id);
      setBookingHistory(bookings);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (appLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  // Render Functions
  const renderHeader = () => (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView('SEARCH')}>
            <TrainFront className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-slate-800">RailConnect</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button 
                  onClick={loadHistory}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm
                    ${view === 'HISTORY' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">My Bookings</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {user.name}
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderSearch = () => (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col">
      <div className="relative bg-blue-900 h-80 flex items-center justify-center">
         <div className="absolute inset-0 overflow-hidden">
           <img src="https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-30" alt="Train Background"/>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
         </div>
         
         <div className="relative z-10 w-full max-w-4xl px-4 -mb-32">
           <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 shadow-sm">Where is your next journey?</h1>
           
           <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
             <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">From</label>
                  <div className="relative flex items-center border rounded-lg bg-slate-50 focus-within:ring-2 ring-blue-500 transition-all">
                    <MapPin className="w-5 h-5 text-blue-500 ml-3" />
                    <input 
                      type="text" 
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full bg-transparent p-3 outline-none font-semibold text-slate-700"
                      placeholder="Source Station"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">To</label>
                  <div className="relative flex items-center border rounded-lg bg-slate-50 focus-within:ring-2 ring-blue-500 transition-all">
                    <MapPin className="w-5 h-5 text-orange-500 ml-3" />
                    <input 
                      type="text" 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-transparent p-3 outline-none font-semibold text-slate-700"
                      placeholder="Destination Station"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Date</label>
                  <div className="relative flex items-center border rounded-lg bg-slate-50 focus-within:ring-2 ring-blue-500 transition-all">
                    <Calendar className="w-5 h-5 text-slate-400 ml-3" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-transparent p-3 outline-none font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Trains
                </button>
             </form>
           </div>
         </div>
      </div>

      <div className="flex-1 mt-40 max-w-6xl mx-auto w-full px-4 pb-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600"><TrainFront className="w-8 h-8"/></div>
              <h3 className="font-bold text-lg mb-2">Live Train Status</h3>
              <p className="text-slate-500 text-sm">Track your train in real-time with our advanced GPS system.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="bg-orange-100 p-4 rounded-full mb-4 text-orange-600"><Clock className="w-8 h-8"/></div>
              <h3 className="font-bold text-lg mb-2">Punctuality Guarantee</h3>
              <p className="text-slate-500 text-sm">We value your time. Accurate predictions on arrival times.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600"><IndianRupee className="w-8 h-8"/></div>
              <h3 className="font-bold text-lg mb-2">Instant Refunds</h3>
              <p className="text-slate-500 text-sm">Cancel anytime. Get refunds processed to your source within minutes.</p>
            </div>
         </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4 text-slate-700">
              <div className="font-bold text-lg">{source}</div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
              <div className="font-bold text-lg">{destination}</div>
              <div className="h-6 w-px bg-slate-300 mx-2"></div>
              <div className="text-slate-500 font-medium">{date}</div>
           </div>
           <button onClick={() => setView('SEARCH')} className="text-blue-600 font-semibold text-sm hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
             Modify Search
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
             <p className="text-lg font-medium">Fetching best trains for you...</p>
             <p className="text-sm">Powered by Gemini AI</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{trains.length} Trains Available</h2>
            {trains.map((train) => (
              <div key={train.trainNumber} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                 <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-lg">
                           <TrainFront className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{train.trainName} <span className="text-sm font-normal text-slate-500">({train.trainNumber})</span></h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                             <span>Runs Daily</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                         <div className="text-right">
                           <div className="text-xl font-bold text-slate-800">{train.departureTime}</div>
                           <div className="text-xs font-semibold text-slate-400 uppercase">{train.source}</div>
                         </div>
                         <div className="flex flex-col items-center px-4">
                            <div className="text-xs text-slate-400 mb-1">{train.duration}</div>
                            <div className="w-24 h-0.5 bg-slate-300 relative">
                                <div className="absolute -top-1 right-0 w-2 h-2 bg-slate-300 rounded-full"></div>
                                <div className="absolute -top-1 left-0 w-2 h-2 bg-slate-300 rounded-full"></div>
                            </div>
                         </div>
                         <div>
                           <div className="text-xl font-bold text-slate-800">{train.arrivalTime}</div>
                           <div className="text-xs font-semibold text-slate-400 uppercase">{train.destination}</div>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {train.availability.map((seat, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handleSelectClass(train, seat)}
                           disabled={seat.status === 'WAITLIST' && seat.available === 0}
                           className={`border rounded-lg p-3 text-left transition-all relative group
                             ${seat.status !== 'WAITLIST' ? 'hover:border-blue-500 hover:bg-blue-50 cursor-pointer' : 'opacity-70 cursor-not-allowed bg-slate-50'}
                           `}
                         >
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-slate-700">{seat.type.split(' ')[0]}</span>
                               <span className="font-bold text-slate-900">₹{seat.price}</span>
                            </div>
                            <div className={`text-sm font-semibold 
                              ${seat.status === 'AVAILABLE' ? 'text-green-600' : 
                                seat.status === 'RAC' ? 'text-orange-500' : 'text-red-500'}`
                            }>
                              {seat.status === 'AVAILABLE' ? `AVAILABLE ${seat.available}` : 
                               seat.status === 'RAC' ? `RAC ${seat.available}` : 'WL'}
                            </div>
                            {seat.status !== 'WAITLIST' && (
                              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                            )}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            My Bookings
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
             <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
             <p>Loading your journeys...</p>
          </div>
        ) : bookingHistory.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
             <TicketIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-700 mb-2">No Bookings Yet</h3>
             <p className="text-slate-500 mb-6">You haven't made any reservations. Plan your first trip now!</p>
             <button onClick={() => setView('SEARCH')} className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-orange-700 transition-colors">
               Book a Ticket
             </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingHistory.map((ticket) => (
              <div 
                key={ticket.pnr} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all cursor-pointer group
                  ${ticket.bookingStatus === 'CANCELLED' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}
                `}
                onClick={() => {
                  setCurrentTicket(ticket);
                  setView('TICKET');
                }}
              >
                <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className={`p-3 rounded-full ${ticket.bookingStatus === 'CANCELLED' ? 'bg-red-50' : 'bg-green-50'}`}>
                       <TrainFront className={`w-6 h-6 ${ticket.bookingStatus === 'CANCELLED' ? 'text-red-500' : 'text-green-600'}`} />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h3 className="font-bold text-slate-800 text-lg">{ticket.train.trainName}</h3>
                         <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ticket.train.trainNumber}</span>
                       </div>
                       <div className="text-sm text-slate-500 mt-0.5">PNR: {ticket.pnr}</div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between w-full md:w-auto gap-8">
                      <div className="text-center md:text-right">
                         <div className="font-bold text-slate-700">{ticket.date}</div>
                         <div className="text-xs text-slate-500 uppercase">{ticket.train.source} → {ticket.train.destination}</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                           ${ticket.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                         `}>
                           {ticket.bookingStatus}
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans">
      {view === 'AUTH' && <Auth />}
      
      {view !== 'AUTH' && view !== 'PAYMENT' && renderHeader()}

      {view === 'SEARCH' && renderSearch()}
      
      {view === 'RESULTS' && renderResults()}
      
      {view === 'HISTORY' && renderHistory()}
      
      {view === 'BOOKING' && selectedTrain && selectedClass && (
        <BookingForm 
          train={selectedTrain} 
          selectedClass={selectedClass} 
          travelDate={date} 
          onProceed={handleBookingProceed}
          onBack={() => setView('RESULTS')}
        />
      )}
      
      {view === 'PAYMENT' && selectedClass && (
        <PaymentGateway 
          amount={selectedClass.price * bookingPassengers.length} 
          onPaymentSuccess={handlePaymentSuccess} 
          onBack={() => setView('BOOKING')}
        />
      )}
      
      {view === 'TICKET' && currentTicket && (
        <TicketView 
          ticket={currentTicket} 
          onHome={() => {
            setCurrentTicket(null);
            setView('SEARCH');
          }}
          onCancelTicket={handleCancelTicket}
        />
      )}
    </div>
  );
}