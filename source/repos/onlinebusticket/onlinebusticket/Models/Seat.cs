using System.ComponentModel.DataAnnotations;

namespace online_bus_ticket.Models
{
    public class Seat
    {
        [Key]
        public int SeatId { get; set; }
        public string SeatNumber { get; set; }

        public int BusId { get; set; }
        public Bus Bus { get; set; }

        public ICollection<BookingSeat> BookingSeats { get; set; }

        
    }
}
