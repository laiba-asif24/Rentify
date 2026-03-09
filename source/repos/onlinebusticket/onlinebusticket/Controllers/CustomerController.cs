using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_bus_ticket.Models;
using onlinebusticket.Data;

namespace onlinebusticket.Controllers
{
    [Authorize(Roles = "Customer")]
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public CustomerController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ========== DASHBOARD ==========
        public async Task<IActionResult> Dashboard()
        {
            var user = await _userManager.GetUserAsync(User);
            ViewBag.UserName = user?.FullName;
            ViewBag.TotalBookings = await _context.Bookings
                .Where(b => b.UserId == user.Id).CountAsync();
            ViewBag.ConfirmedBookings = await _context.Bookings
                .Where(b => b.UserId == user.Id && b.Status == "Confirmed").CountAsync();
            ViewBag.PendingBookings = await _context.Bookings
                .Where(b => b.UserId == user.Id && b.Status == "Pending").CountAsync();
            return View();
        }

        // ========== MY BOOKINGS ==========
        public async Task<IActionResult> MyBookings()
        {
            var user = await _userManager.GetUserAsync(User);
            var userId = user.Id;

            var bookings = await _context.Bookings
                .Include(b => b.BusSchedule)
                .ThenInclude(s => s.Bus)
                .Include(b => b.BusSchedule)
                .ThenInclude(s => s.Route)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return View(bookings);
        }
        // ========== SEAT SELECTION ==========
        public async Task<IActionResult> SeatSelection(int scheduleId)
        {
            var schedule = await _context.BusSchedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);

            if (schedule == null)
                return NotFound();

            var bookedSeats = await _context.BookingSeats
                .Where(bs => bs.Booking.ScheduleId == scheduleId)
                .Select(bs => bs.SeatId)
                .ToListAsync();

            ViewBag.BookedSeats = bookedSeats;
            return View(schedule);
        }

        // ========== BOOKING CONFIRM ==========
        [HttpPost]
        public async Task<IActionResult> BookingConfirm(int scheduleId, string selectedSeats, decimal totalAmount)
        {
            var user = await _userManager.GetUserAsync(User);
            var schedule = await _context.BusSchedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);

            if (schedule == null || string.IsNullOrEmpty(selectedSeats))
                return RedirectToAction("Dashboard");

            var booking = new Booking
            {
                UserId = user.Id,
                ScheduleId = scheduleId,
                BookingDate = DateTime.Now,
                TotalAmount = totalAmount,
                Status = "Confirmed"
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var seatNumbers = selectedSeats.Split(',').ToList();
            foreach (var seatNum in seatNumbers)
            {
                var seat = await _context.Seats
                    .FirstOrDefaultAsync(s => s.SeatNumber == seatNum && s.BusId == schedule.BusId);

                if (seat != null)
                {
                    _context.BookingSeats.Add(new BookingSeat
                    {
                        BookingId = booking.BookingId,
                        SeatId = seat.SeatId,
                        SeatNumber = int.Parse(seatNum)
                    });
                }
            }
            await _context.SaveChangesAsync();

            ViewBag.BookingId = booking.BookingId;
            ViewBag.From = schedule.Route?.SourceCity;
            ViewBag.To = schedule.Route?.DestinationCity;
            ViewBag.BusNumber = schedule.Bus?.BusNumber;
            ViewBag.DepartureTime = schedule.DepartureTime.ToString("dd MMM yyyy hh:mm tt");
            ViewBag.Seats = selectedSeats;
            ViewBag.TotalAmount = totalAmount;

            return View();
        }
        // ========== CANCEL BOOKING ==========
        public async Task<IActionResult> CancelBooking(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            var booking = await _context.Bookings
                .Include(b => b.BusSchedule)
                .ThenInclude(s => s.Route)
                .Include(b => b.BusSchedule)
                .ThenInclude(s => s.Bus)
                .FirstOrDefaultAsync(b => b.BookingId == id && b.UserId == user.Id);

            if (booking == null)
                return RedirectToAction("MyBookings");

            ViewBag.Booking = booking;
            return View(booking);
        }

        [HttpPost]
        public async Task<IActionResult> CancelBookingConfirmed(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == id && b.UserId == user.Id);

            if (booking != null)
            {
                booking.Status = "Cancelled";
                await _context.SaveChangesAsync();
                TempData["Success"] = "Booking cancelled successfully!";
            }

            return RedirectToAction("MyBookings");
        }

        // ========== SEARCH BUS ==========
        public IActionResult SearchBus()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> SearchResults(string from, string to, string date)
        {
            ViewBag.From = from;
            ViewBag.To = to;
            ViewBag.Date = date;

            var schedules = await _context.BusSchedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .Where(s => s.Route.SourceCity == from &&
                            s.Route.DestinationCity == to)
                .ToListAsync();

            return View(schedules);
        }

    }
}