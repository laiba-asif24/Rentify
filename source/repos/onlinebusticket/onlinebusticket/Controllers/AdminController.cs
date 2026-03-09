using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_bus_ticket.Models;
using onlinebusticket.Data;

namespace onlinebusticket.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ========== DASHBOARD ==========
        public async Task<IActionResult> Dashboard()
        {
            ViewBag.TotalBuses = await _context.Buses.CountAsync();
            ViewBag.TotalBookings = await _context.Bookings.CountAsync();
            ViewBag.TotalEmployees = await _userManager.GetUsersInRoleAsync("Employee");
            ViewBag.TotalRevenue = await _context.Payments.SumAsync(p => p.Amount);
            return View();
        }

        // ========== BUS CRUD ==========
        public async Task<IActionResult> Buses()
        {
            var buses = await _context.Buses.ToListAsync();
            return View(buses);
        }

        public IActionResult BusCreate()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> BusCreate(Bus bus)
        {
          
            ModelState.Remove("BusSchedules");
            ModelState.Remove("Seats");

            if (ModelState.IsValid)
            {
                bus.IsActive = true;
                _context.Buses.Add(bus);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Bus added successfully!";
                return RedirectToAction("Buses");
            }
            return View(bus);
        }

        public async Task<IActionResult> BusEdit(int id)
        {
            var bus = await _context.Buses.FindAsync(id);
            if (bus == null) return NotFound();
            return View(bus);
        }
        [HttpPost]
        public async Task<IActionResult> BusEdit(Bus bus)
        {
            ModelState.Remove("BusSchedules");
            ModelState.Remove("Seats");

            if (ModelState.IsValid)
            {
                _context.Buses.Update(bus);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Bus updated successfully!";
                return RedirectToAction("Buses");
            }
            return View(bus);
        }

        public async Task<IActionResult> BusDelete(int id)
        {
            var bus = await _context.Buses.FindAsync(id);
            if (bus != null)
            {
                // Pehle Seats delete karo
                var seats = await _context.Seats
                    .Where(s => s.BusId == id).ToListAsync();
                _context.Seats.RemoveRange(seats);

                // Phir Schedules delete karo
                var schedules = await _context.BusSchedules
                    .Where(s => s.BusId == id).ToListAsync();
                _context.BusSchedules.RemoveRange(schedules);

                await _context.SaveChangesAsync();

                _context.Buses.Remove(bus);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Bus deleted successfully!";
            }
            return RedirectToAction("Buses");
        }

        // ========== EMPLOYEE CRUD ==========
        public async Task<IActionResult> Employees()
        {
            var employees = await _userManager.GetUsersInRoleAsync("Employee");
            return View(employees);
        }

        public IActionResult EmployeeCreate()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> EmployeeCreate(User user, string password)
        {
            ModelState.Remove("Role");
            ModelState.Remove("Bookings");
            ModelState.Remove("Enquiries");
            ModelState.Remove("RoleId");

            if (ModelState.IsValid)
            {
                user.IsActive = true;
                user.EmailConfirmed = true;
                user.UserName = user.Email;
                user.RoleId = 2; // Employee Role ID
                var result = await _userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, "Employee");
                    TempData["Success"] = "Employee added successfully!";
                    return RedirectToAction("Employees");
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }
            return View(user);
        }
        public async Task<IActionResult> EmployeeDelete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Employee deleted successfully!";
            }
            return RedirectToAction("Employees");
        }



        // ========== ROUTES CRUD ==========
        public async Task<IActionResult> Routes()
        {
            var routes = await _context.Routes.ToListAsync();
            return View(routes);
        }

        public IActionResult RouteCreate()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> RouteCreate(BusRoute route)
        {
            ModelState.Remove("BusSchedules");
            if (ModelState.IsValid)
            {
                _context.Routes.Add(route);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Route added successfully!";
                return RedirectToAction("Routes");
            }
            return View(route);
        }

        public async Task<IActionResult> RouteEdit(int id)
        {
            var route = await _context.Routes.FindAsync(id);
            if (route == null) return NotFound();
            return View(route);
        }

        [HttpPost]
        public async Task<IActionResult> RouteEdit(BusRoute route)
        {
            ModelState.Remove("BusSchedules");
            if (ModelState.IsValid)
            {
                _context.Routes.Update(route);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Route updated successfully!";
                return RedirectToAction("Routes");
            }
            return View(route);
        }

        public async Task<IActionResult> RouteDelete(int id)
        {
            var route = await _context.Routes.FindAsync(id);
            if (route != null)
            {
                // Pehle Schedules delete karo
                var schedules = await _context.BusSchedules
                    .Where(s => s.RouteId == id).ToListAsync();
                _context.BusSchedules.RemoveRange(schedules);
                await _context.SaveChangesAsync();

                _context.Routes.Remove(route);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Route deleted successfully!";
            }
            return RedirectToAction("Routes");
        }

        // ========== BOOKINGS ==========
        public async Task<IActionResult> Bookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.BusSchedule)
                .ThenInclude(s => s.Bus)
                .ToListAsync();
            return View(bookings);
        }

        public async Task<IActionResult> BookingDelete(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking != null)
            {
                // Pehle BookingSeats delete karo
                var bookingSeats = await _context.BookingSeats
                    .Where(bs => bs.BookingId == id)
                    .ToListAsync();
                _context.BookingSeats.RemoveRange(bookingSeats);
                await _context.SaveChangesAsync();

                // Phir Booking delete karo
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Booking deleted successfully!";
            }
            return RedirectToAction("Bookings");
        }
        // ========== REPORTS ==========
        public async Task<IActionResult> Reports()
        {
            ViewBag.TotalBuses = await _context.Buses.CountAsync();
            ViewBag.TotalRoutes = await _context.Routes.CountAsync();
            ViewBag.TotalBookings = await _context.Bookings.CountAsync();
            ViewBag.TotalRevenue = await _context.Payments.SumAsync(p => p.Amount);
            ViewBag.TotalEmployees = (await _userManager.GetUsersInRoleAsync("Employee")).Count;
            ViewBag.TotalCustomers = (await _userManager.GetUsersInRoleAsync("Customer")).Count;
            ViewBag.ConfirmedBookings = await _context.Bookings.CountAsync(b => b.Status == "Confirmed");
            ViewBag.CancelledBookings = await _context.Bookings.CountAsync(b => b.Status == "Cancelled");
            return View();
        }

    }
}