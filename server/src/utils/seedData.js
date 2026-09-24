const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');

const seedDatabase = async () => {
  try {
    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theater.deleteMany({}),
      Screen.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      SeatLock.deleteMany({}),
    ]);

    console.log('[Seed] Cleared existing data.');

    // 1. Seed Users
    const admin = await User.create({
      name: 'Admin Cinema Manager',
      email: 'admin@bookmyshow.com',
      password: 'admin123',
      phone: '+91 98765 43210',
      role: 'admin',
    });

    const testUser = await User.create({
      name: 'Rahul Sharma',
      email: 'user@bookmyshow.com',
      password: 'user123',
      phone: '+91 91234 56789',
      role: 'user',
    });

    console.log('[Seed] Created default users: admin@bookmyshow.com & user@bookmyshow.com');

    // 2. Seed Movies
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        language: ['English', 'Hindi'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        rating: 8.8,
        votes: 38500,
        director: 'Denis Villeneuve',
        certificate: 'UA',
        casts: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides' },
          { name: 'Zendaya', role: 'Chani' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
          { name: 'Javier Bardem', role: 'Stilgar' },
        ],
        isUpcoming: false,
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool. They team up to defeat a common enemy in a multiverse-spanning adventure filled with chaotic humor and adrenaline-pumping action.',
        genre: ['Action', 'Comedy', 'Sci-Fi'],
        language: ['English', 'Hindi'],
        duration: 128,
        releaseDate: new Date('2024-07-26'),
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        rating: 8.2,
        votes: 42100,
        director: 'Shawn Levy',
        certificate: 'A',
        casts: [
          { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool' },
          { name: 'Hugh Jackman', role: 'Logan / Wolverine' },
          { name: 'Emma Corrin', role: 'Cassandra Nova' },
        ],
        isUpcoming: false,
      },
      {
        title: 'Kalki 2898 AD',
        description: 'Set in a post-apocalyptic world in the year 2898 AD, a modern avatar of Vishnu descends to Earth to protect the world from evil forces. An epic blend of Indian mythology and futuristic cyberpunk technology.',
        genre: ['Action', 'Sci-Fi', 'Mythology'],
        language: ['Telugu', 'Hindi', 'Tamil'],
        duration: 181,
        releaseDate: new Date('2024-06-27'),
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=y1-w1pUaMh4',
        rating: 8.1,
        votes: 56000,
        director: 'Nag Ashwin',
        certificate: 'UA',
        casts: [
          { name: 'Prabhas', role: 'Bhairava' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
          { name: 'Deepika Padukone', role: 'SUM-80' },
          { name: 'Kamal Haasan', role: 'Supreme Yaskin' },
        ],
        isUpcoming: false,
      },
      {
        title: 'Interstellar: 10th Anniversary IMAX',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
        genre: ['Adventure', 'Drama', 'Sci-Fi'],
        language: ['English'],
        duration: 169,
        releaseDate: new Date('2024-10-06'),
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        rating: 8.9,
        votes: 89000,
        director: 'Christopher Nolan',
        certificate: 'UA',
        casts: [
          { name: 'Matthew McConaughey', role: 'Cooper' },
          { name: 'Anne Hathaway', role: 'Brand' },
          { name: 'Jessica Chastain', role: 'Murph' },
        ],
        isUpcoming: false,
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        genre: ['Action', 'Adventure', 'Drama'],
        language: ['English', 'Hindi'],
        duration: 148,
        releaseDate: new Date('2026-11-22'),
        posterUrl: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        rating: 8.5,
        votes: 12000,
        director: 'Ridley Scott',
        certificate: 'A',
        casts: [
          { name: 'Paul Mescal', role: 'Lucius Verus' },
          { name: 'Pedro Pascal', role: 'Marcus Acacius' },
          { name: 'Denzel Washington', role: 'Macrinus' },
        ],
        isUpcoming: true,
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'The third chapter in James Cameron epic sci-fi series exploring Pandora, delving into new biomes and introducing the aggressive Ash People na vi clan who reflect the destructive nature of fire.',
        genre: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
        language: ['English', 'Hindi'],
        duration: 190,
        releaseDate: new Date('2026-12-19'),
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        rating: 8.7,
        votes: 15400,
        director: 'James Cameron',
        certificate: 'UA',
        casts: [
          { name: 'Sam Worthington', role: 'Jake Sully' },
          { name: 'Zoe Saldana', role: 'Neytiri' },
          { name: 'Sigourney Weaver', role: 'Kiri' },
        ],
        isUpcoming: true,
      },
    ];

    const movies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Created ${movies.length} movies.`);

    // 3. Seed Theaters across major cities
    const theatersData = [
      {
        name: 'PVR ICON: Phoenix Palladium',
        city: 'Mumbai',
        address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
        facilities: ['Dolby Atmos', '4K Laser Projection', 'Gourmet Lounge', 'Valet Parking'],
      },
      {
        name: 'INOX Megaplex: Inorbit Mall',
        city: 'Mumbai',
        address: 'Link Road, Malad West, Mumbai, Maharashtra 400064',
        facilities: ['IMAX with Laser', 'MX4D', 'Insignia Lounge', 'Recliner Seats'],
      },
      {
        name: 'PVR Director’s Cut: Ambience Mall',
        city: 'Delhi-NCR',
        address: 'Nelson Mandela Road, Vasant Kunj, New Delhi 110070',
        facilities: ['Luxury Recliner', 'Chef Menu Service', 'Dolby Atmos', 'VIP Valet'],
      },
      {
        name: 'PVR Superplex: Forum South Bengaluru',
        city: 'Bengaluru',
        address: 'Konanakunte Cross, Kanakapura Road, Bengaluru 560062',
        facilities: ['IMAX', '4DX', 'Playhouse', 'Dolby Atmos 7.1'],
      },
      {
        name: 'Prasads Multiplex: Large Screen',
        city: 'Hyderabad',
        address: 'NTR Gardens, Khairatabad, Hyderabad, Telangana 500063',
        facilities: ['Giant Screen', 'Dolby Atmos', 'Food Court', 'Ample Parking'],
      },
    ];

    const theaters = await Theater.insertMany(theatersData);
    console.log(`[Seed] Created ${theaters.length} theaters.`);

    // 4. Seed Screens for each theater
    const defaultSeatLayout = {
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      columns: 12,
      aisles: [3, 9], // gaps after seat 3 and 9 for walkway
      tiers: [
        { name: 'Recliner', rows: ['A'] },
        { name: 'Premium', rows: ['B', 'C', 'D'] },
        { name: 'Gold', rows: ['E', 'F', 'G'] },
        { name: 'Silver', rows: ['H'] },
      ],
    };

    const screens = [];
    for (const theater of theaters) {
      const screen1 = await Screen.create({
        theaterId: theater._id,
        screenNumber: 'Audi 1 (Dolby Cinema)',
        screenType: 'Dolby Cinema',
        soundSystem: 'Dolby Atmos 7.1',
        seatLayout: defaultSeatLayout,
        totalSeats: 96,
      });

      const screen2 = await Screen.create({
        theaterId: theater._id,
        screenNumber: 'Audi 2 (IMAX 3D)',
        screenType: 'IMAX 3D',
        soundSystem: '12-Channel IMAX Immersion Audio',
        seatLayout: defaultSeatLayout,
        totalSeats: 96,
      });

      screens.push(screen1, screen2);
    }
    console.log(`[Seed] Created ${screens.length} cinema screens.`);

    // 5. Seed Shows for Today, Tomorrow, and Next Day
    const today = new Date();
    const dates = [0, 1, 2].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    });

    const timeSlots = ['10:15 AM', '01:45 PM', '05:30 PM', '09:00 PM'];
    const nowShowingMovies = movies.filter((m) => !m.isUpcoming);

    const showsToInsert = [];
    for (const theater of theaters) {
      const theaterScreens = screens.filter((s) => s.theaterId.toString() === theater._id.toString());
      if (theaterScreens.length === 0) continue;

      for (const date of dates) {
        for (let i = 0; i < nowShowingMovies.length; i++) {
          const movie = nowShowingMovies[i];
          const screen = theaterScreens[i % theaterScreens.length];
          const time = timeSlots[(i + parseInt(date.slice(-2))) % timeSlots.length];

          showsToInsert.push({
            movieId: movie._id,
            theaterId: theater._id,
            screenId: screen._id,
            date,
            startTime: time,
            endTime: '02:30 hrs later',
            language: movie.language[0] || 'English',
            format: screen.screenType.includes('IMAX') ? 'IMAX 3D' : '2D',
            pricing: {
              Silver: 180,
              Gold: 240,
              Premium: 350,
              Recliner: 550,
            },
          });
        }
      }
    }

    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`[Seed] Created ${insertedShows.length} showtimes across dates.`);

    // 6. Seed a sample completed booking for testing and analytics
    if (insertedShows.length > 0) {
      const sampleShow = insertedShows[0];
      const bookedSeats = [
        { seatNumber: 'D5', tier: 'Premium', price: 350 },
        { seatNumber: 'D6', tier: 'Premium', price: 350 },
      ];

      const subtotal = 700;
      const convenienceFee = 71;
      const totalAmount = subtotal + convenienceFee;

      const sampleBooking = await Booking.create({
        bookingId: 'BMS-998821-DEMO',
        userId: testUser._id,
        showId: sampleShow._id,
        seats: bookedSeats,
        subtotal,
        convenienceFee,
        totalAmount,
        paymentStatus: 'completed',
        paymentMethod: 'UPI',
        transactionId: 'TXN-DEMO-998821',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        bookingStatus: 'confirmed',
      });

      // Insert seat locks for these booked seats
      await SeatLock.insertMany([
        {
          showId: sampleShow._id,
          seatNumber: 'D5',
          tier: 'Premium',
          price: 350,
          lockedBy: testUser._id,
          status: 'booked',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          bookingId: sampleBooking._id,
        },
        {
          showId: sampleShow._id,
          seatNumber: 'D6',
          tier: 'Premium',
          price: 350,
          lockedBy: testUser._id,
          status: 'booked',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          bookingId: sampleBooking._id,
        },
      ]);

      console.log('[Seed] Created sample booking and booked seat locks for demonstration.');
    }

    console.log('[Seed] Successfully completed database seeding!');
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
