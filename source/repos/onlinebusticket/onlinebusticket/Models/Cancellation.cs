using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_bus_ticket.Models
{
    public class Cancellation
    {
        [Key]
        public int CancellationId { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal RefundAmount { get; set; }
        public DateTime CancelDate { get; set; }

        public int BookingId { get; set; }
        public Booking Booking { get; set; }

    }
}
