import chai from 'chai';
const expect = chai.expect;

import Bookings from '../src/bookings';
import bookingsInfo from '../test-info/bookings-info.js';

describe('bookingsInfo', function() {
  let bookings;
  beforeEach(() => {
    bookings = new Bookings(bookingsInfo);
  });

  it('should be a function', function() {
    expect(Bookings).to.be.a('function');
  });

  it('should hold bookings', function() {
    expect(bookings.bookings[0]).to.deep.equal(  {
        "id":"5fwrgu4i7k55hl6sz",
        "userID":9,
        "date":"2020/02/04",
        "roomNumber":15,
        "roomServiceCharges":[]
      }
    );
  });

  describe('viewBookings', function() {
    it('should return all bookings for specified guest', function() {
      expect(bookings.viewBookings(9).length).to.equal(1);
      expect(bookings.viewBookings(9)[0]).to.deep.equal( {
          "id":"5fwrgu4i7k55hl6sz",
          "userID":9,
          "date":"2020/02/04",
          "roomNumber":15,
          "roomServiceCharges":[]
        }
      );
    });
  });

  describe('addBooking', function() {
    it('should return all bookings for specified guest', function() {
      expect(bookings.makeBooking(9, "2020/02/04", 15).userID).to.equal(9);
    });
  });

  describe('findBookingId', function() {
    it('should return all bookings for specified guest', function() {
      expect(bookings.findBookingId(9, "2020/02/04")).to.equal("5fwrgu4i7k55hl6sz");
    });
  });

});
