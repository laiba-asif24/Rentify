using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;


namespace online_bus_ticket.Models
{
    public class User : IdentityUser<int>
    {
        [Required]
        public string FullName { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int RoleId { get; set; }
        public Role Role { get; set; }

        public ICollection<Booking> Bookings { get; set; }
        public ICollection<Enquiry> Enquiries { get; set; }
    }
}

