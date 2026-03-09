using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_bus_ticket.Models
{
    public class BookingSeat
    {
        [Key]
        public int BookingSeatId { get; set; }
        public int BookingId { get; set; }
        public Booking Booking { get; set; }
        public int SeatId { get; set; }
        public Seat Seat { get; set; }
        public int SeatNumber { get; set; }
    }
}