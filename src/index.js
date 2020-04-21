import $ from 'jquery';
import './css/base.scss';
import Hotel from './hotel';
import BookingsRepository from './bookings';

let roomsFetchedData = fetch('https://fe-apps.herokuapp.com/api/v1/overlook/1904/rooms/rooms')
.then(response => response.json());

let bookingsFetchedData = fetch('https://fe-apps.herokuapp.com/api/v1/overlook/1904/bookings/bookings')
.then(response => response.json());

let guestsFetchedData = fetch('https://fe-apps.herokuapp.com/api/v1/overlook/1904/users/users')
.then(response => response.json());

let todayDate = getTodayDate();
let guestsData;
let guestId;
let bookingsData;
let bookingsRepository;
let customerName;
let hotel;
let roomsData;

Promise.all([roomsFetchedData, bookingsFetchedData, guestsFetchedData])
.then(data => {
  roomsData = data[0].rooms;
  bookingsData = data[1].bookings;
  guestsData = data[2].users;
})
.then(() => {
  bookingsRepository = new BookingsRepository(bookingsData);
  hotel = new Hotel(roomsData, bookingsRepository);
})
.then(() => {
  addManagerDataToDom();
  addGuestDataToDOM();
})
.catch(error => {
  console.log(error);
});

$('#login-button').click(() => {
  if ($('#username-input').val().includes('customer') && $('#password-input').val() === 'overlook2020') {
    $('')
    guestId = $('#username-input').val().split('r')[1];
    localStorage.setItem('guestId', guestId);
    $('#login-container').addClass('hide');
    $('.guest-view').removeClass('hide');
    $('.schedule-stay').removeClass('hide')
  } else if ($('#username-input').val() === 'manager' && $('#password-input').val() === 'overlook2020') {
      $('#login-container').addClass('hide');
      $('.manager-view').removeClass('hide');
      $('.schedule-stay').removeClass('hide');
      $('.manage-guests').removeClass('hide');
  } else {
    $('#login-error').removeClass('hide');
  }
});

$('#username-input').keyup(() => {
  $('#login-error').addClass('hide');
});

$('#password-input').keyup(() => {
  $('#login-error').addClass('hide');
});

function addGuestDataToDOM() {
  guestId = parseInt(localStorage.getItem('guestId'));
  showBookings('#guest-booking-info');
  showBookings('.manager-bookings-list');
  customerName = localStorage.getItem('customerName');
  $('.guest-name').text(customerName);
  $('#total-spent').text(`$${hotel.returnTotalSpent(guestId)}`);
  $('#reward-remainder').text(`$${10000 - hotel.returnTotalSpent(guestId)}`);
}

function addManagerDataToDom() {
  $('#rooms-available').text(hotel.viewRoomsAvailable(todayDate).length);
  $('#percent-occupied').text(`${hotel.returnPercentRoomsOccupied(todayDate)}%`);
  $('#total-revenue').text(`$${hotel.returnTotalRevenue(todayDate)}`);
}

function logIn() {
  let customer = guestsData.find(guest => guest.name === $('#customer-input').val());
  guestId = customer.id;
  localStorage.setItem('guestId', guestId);
  customerName = customer.name;
  localStorage.setItem('customerName', customerName);
}

$('#available-rooms').click(() => {
  if ($('.searched-room').hasClass('hoverable')) {
    $('.searched-room').removeClass('hoverable');
    $(event.target).closest('section').addClass('clicked');
  } else if ($(event.target).closest('section').hasClass('clicked')) {
    $('.searched-room').addClass('hoverable');
    $(event.target).closest('section').removeClass('clicked');
  }
});

$('#find-available-rooms-button').click(() => {
  let numDate = numifyDate($('#start-date').val(), '-');
  let date = stringifyDate(numDate);
  if (checkDate(date)) {
    showAvailableRooms(hotel.viewRoomsAvailable(date));
  } else {
    $('#available-rooms').text('');
    $('#available-rooms').append(`
      <br/>
      OOOPS! It looks like you have selected a past date. Please try again with a future date!
      `
    )
  }
});

function showAvailableRooms(method) {
  $('#available-rooms').text('');
  if (method.length) {
    method.forEach(room => {
      $('#available-rooms').append(
        `
        <section class='searched-room' tabindex=1>
        <b>ROOM NUMBER</b>: ${room.number}
        </br>
        <b>ROOM TYPE</b>: ${room.roomType}
        </br>
        <b>NUMBER OF BEDS</b>: ${room.numBeds}
        </br>
        <b>BED SIZE</b>: ${room.bedSize}
        </br>
        <b>PRICE</b>: $${room.costPerNight}
        <br/>
        <br/>
        </section>
        `
      )
    })
    $('.searched-room').addClass('hoverable');
  } else {
    $('#available-rooms').append(
      `
      <b>Apologies, but it looks like there is not vacancy for the desired date.</b>
      `
    )
  }
}

$('.complete-booking-button').click(() => {
  if ($('.clicked').html()) {
    completeBooking();
  }
});

function completeBooking() {
  let numDate = numifyDate($('#start-date').val(), '-');
  let bookingDate = stringifyDate(numDate);
  let roomNumber = parseInt($('.clicked').html().split('x')[1]);
  let postData = bookingsRepository.makeBooking(guestId, bookingDate, roomNumber);
  fetch('https://fe-apps.herokuapp.com/api/v1/overlook/1904/bookings/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })
  .then(() => showSuccessPage())
  .catch(error => {
    console.log(error);
  });
}

$('.filter-button').click(() => {
  let numDate = numifyDate($('#start-date').val(), '-');
  let bookingDate = stringifyDate(numDate);
  $('#guest-filter-page').addClass('hide');
  let filteredRooms = hotel.filterAvailableRooms(bookingDate, $('select').val());
  showAvailableRooms(filteredRooms);
});


$('.show-filter-options-button').click(() => {
  $('.searched-room').removeClass('hoverable');
  $('#guest-filter-page').removeClass('hide');
});

function checkDate(inputDate) {
  let guestDate = numifyDate(inputDate, '/');
  let todayDate = numifyDate(getTodayDate(), '/');
  if (guestDate > todayDate) {
    return true;
  } else {
    return false;
  }
}

function getTodayDate() {
  let date = new Date();
  let month = date.getUTCMonth() + 1;
  let day = date.getUTCDate();
  let year = date.getUTCFullYear();
  if (day < 10 && month < 10) {
    return `${year}/0${month}/0${day}`;
  } else if (day < 10 && month >= 10) {
    return `${year}/${month}/0${day}`;
  } else if (day >= 10 && month < 10) {
    return `${year}/0${month}/${day}`;
  } else {
    return `${year}/${month}/${day}`;
  }
}

function numifyDate(date, character) {
  let year = parseInt(date.split(character)[0]);
  let month = parseInt(date.split(character)[1]);
  let day = parseInt(date.split(character)[2]);
  if (day < 10 && month < 10) {
    return parseInt(`${year}0${month}0${day}`);
  } else if (day < 10 && month >= 10) {
    return parseInt(`${year}${month}0${day}`);
  } else if (day >= 10 && month < 10) {
    return parseInt(`${year}0${month}${day}`);
  } else {
    return parseInt(`${year}${month}${day}`);
  }
}



function showBookings(section) {
  $(section).text('');
  let bookingDates = bookingsRepository.viewBookings(guestId).map(booking => booking.date)
  let sortedBookings = sortDates(bookingDates);
  if (section === '.manager-bookings-list') {
    sortedBookings.forEach(date => {
      $(section).append(
        `
        <section class='bookings-date'>
        <b id='x${date}x'></b>
        <p><b>DATE</b>: ${date}</p>
        <br/>
        <button type='button' name='delete-booking-button' class='delete-booking-button'>DELETE BOOKING</button>
        </section>
        `
      )
    })
  } else {
    sortedBookings.forEach(date => {
      $(section).append(
        `
        <section class='bookings-date'>
        <b>DATE</b>: ${date}
        <br/>
        </section>
        `
      )
    })
  }
  $('.bookings-date').addClass('hoverable');
}

function showSuccessPage() {
  $('.clicked').removeClass('clicked');
  $('#guest-success-page').removeClass('hide');
}

function sortDates(dates) {
  let numDates = [];
  dates.forEach(date => {
    numDates.push(numifyDate(date, '/'));
  })
  return numDates.sort((a, b) => b - a).map(date => stringifyDate(date))
}

function stringifyDate(date) {
  let splitDate = date.toString().split('');
  let year = `${splitDate[0]}${splitDate[1]}${splitDate[2]}${splitDate[3]}`;
  let month = `${splitDate[4]}${splitDate[5]}`;
  let day = `${splitDate[6]}${splitDate[7]}`;
  return `${year}/${month}/${day}`
}
