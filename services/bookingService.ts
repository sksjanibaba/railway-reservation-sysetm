import { supabase } from './supabaseClient';
import { Ticket } from '../types';

export const saveBooking = async (userId: string, ticket: Ticket) => {
  // Assumes a table 'bookings' exists in Supabase
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: userId,
          pnr: ticket.pnr,
          status: ticket.bookingStatus,
          ticket_details: ticket,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (saveBooking):', error);
      // We don't throw here to allow the UI to show the ticket even if DB save fails (offline mode simulation)
      // But in production you might want to throw.
    }
    return data;
  } catch (err) {
    console.error('Failed to save booking to backend:', err);
    throw err;
  }
};

export const cancelBooking = async (pnr: string) => {
  try {
    // We update the status column.
    // Note: In a real app, we should also update the ticket_details JSON to match, 
    // or rely solely on the status column for truth.
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('pnr', pnr)
      .select()
      .single();

    if (error) {
       console.error('Supabase Error (cancelBooking):', error);
       throw error;
    }
    return data;
  } catch (err) {
    console.error('Failed to cancel booking in backend:', err);
    throw err;
  }
};

export const getUserBookings = async (userId: string): Promise<Ticket[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error (getUserBookings):', error);
      return [];
    }

    // Map database rows back to Ticket objects
    // We override the ticket_details.bookingStatus with the actual column status
    // to ensure if it was cancelled, the UI reflects it.
    return data.map((row: any) => ({
      ...row.ticket_details,
      bookingStatus: row.status 
    }));
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    return [];
  }
};