using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_bus_ticket.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }
        public DateTime BookingDate { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int ScheduleId { get; set; }
        public BusSchedule BusSchedule { get; set; }

        public ICollection<BookingSeat> BookingSeats { get; set; }
        public ICollection<Payment> Payments { get; set; }
        public Cancellation Cancellation { get; set; }

    }
}
