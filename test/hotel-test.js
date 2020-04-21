import chai from 'chai';
const expect = chai.expect;

import Hotel from '../src/hotel';
import hotelInfo from '../test-info/hotel-info.js';
import Bookings from '../src/bookings';
import bookingsInfo from '../test-info/bookings-info.js';

describe('Hotel', function() {
  let hotel, bookings;
  beforeEach(() => {
    bookings = new Bookings(bookingsInfo);
    hotel = new Hotel(hotelInfo, bookingsInfo);
  });

  it('should be a function', function() {
    expect(Hotel).to.be.a('function');
  });

  it('should hold hotel rooms', function() {
    expect(hotel.rooms.length).to.equal(3);
    expect(hotel.rooms[0].roomType).to.equal('residential suite');
  });


});
