# Ticket ID Generator Utility

A comprehensive utility for generating, tracking, and managing unique ticket IDs for travel services.

## Features

### 🎫 Multiple ID Types
- **Flight Tickets** (FL): `FL241215ABC123`
- **Bus Tickets** (BS): `BS241215DEF456`
- **Ferry Tickets** (FR): `FR241215GHI789`
- **Train Tickets** (TR): `TR241215JKL012`
- **Hotel Bookings** (HT): `HT241215MNO345`
- **Tour Packages** (TO): `TO241215PQR678`

### 🔧 ID Generation Options
- **Timestamp Integration**: Include date in ID format (YYMMDD)
- **Random Components**: Secure alphanumeric strings
- **Booking References**: Short 6-character codes
- **Confirmation Numbers**: Letter-number combinations

### 📊 Tracking & Management
- **Unique ID Generation**: Prevents duplicates
- **Usage Tracking**: Mark IDs as used/unused
- **History Management**: View generation history
- **Statistics**: Track generation patterns
- **Local Storage**: Persistent data across sessions

## Usage Examples

### Basic ID Generation

```javascript
import { generateTicketId, ticketIdTracker } from '../utils/ticketIdGenerator'

// Generate a flight ticket ID
const flightId = generateTicketId('FLIGHT', true)
// Result: FL241215ABC123

// Generate without timestamp
const simpleId = generateTicketId('BUS', false)
// Result: BSDEF456

// Generate booking reference
const bookingRef = generateBookingReference()
// Result: XYZ789
```

### Using the Tracker

```javascript
import { ticketIdTracker } from '../utils/ticketIdGenerator'

// Generate unique ID (prevents duplicates)
const uniqueId = ticketIdTracker.generateUniqueId('FLIGHT')

// Mark ID as used
ticketIdTracker.markAsUsed(uniqueId)

// Get statistics
const stats = ticketIdTracker.getStats()
console.log(stats)
// {
//   totalGenerated: 15,
//   totalUsed: 8,
//   totalUnused: 7,
//   typeStats: { FLIGHT: 5, BUS: 3, HOTEL: 7 }
// }

// Get history
const history = ticketIdTracker.getHistory()
```

### ID Validation

```javascript
import { validateTicketId, getTicketType } from '../utils/ticketIdGenerator'

// Validate ID format
const isValid = validateTicketId('FL241215ABC123')
// Result: true

// Get ticket type from ID
const type = getTicketType('FL241215ABC123')
// Result: 'FLIGHT'
```

## React Component Integration

### TicketIdGenerator Component

The `TicketIdGenerator` component provides a complete UI for:

- Selecting ticket types
- Generating various ID formats
- Viewing generation history
- Managing ID usage status
- Copying IDs to clipboard
- Clearing tracker data

```jsx
import TicketIdGenerator from '../components/TicketIdGenerator'

function MyComponent() {
  const handleIdGenerated = (ticketId, type) => {
    console.log(`Generated ${type} ID: ${ticketId}`)
    // Handle the generated ID (e.g., auto-fill forms)
  }

  return (
    <TicketIdGenerator 
      onIdGenerated={handleIdGenerated}
      onClose={() => setShowGenerator(false)}
    />
  )
}
```

### Integration with TicketTracker

The generator is integrated into the `TicketTracker` page as a modal overlay:

- Click "Generate ID" button to open
- Generate IDs for testing or demo purposes
- Auto-fill search forms with generated IDs
- Track all generated IDs with usage status

## ID Format Specifications

### Standard Format
`[PREFIX][TIMESTAMP][RANDOM]`

- **PREFIX**: 2-letter service code (FL, BS, FR, TR, HT, TO)
- **TIMESTAMP**: YYMMDD format (optional)
- **RANDOM**: 6-character alphanumeric string

### Examples
- `FL241215ABC123` - Flight ticket with timestamp
- `BSDEF456` - Bus ticket without timestamp
- `HT241215XYZ789` - Hotel booking with timestamp

### Booking References
- Format: 6 random alphanumeric characters
- Example: `ABC123`

### Confirmation Numbers
- Format: 2 letters + 4 numbers
- Example: `AB1234`

## Data Persistence

The tracker uses `localStorage` to persist:
- Generated ID history
- Usage status
- Generation statistics
- Tracker configuration

Data survives browser sessions and page refreshes.

## Security Features

- **Collision Prevention**: Checks for duplicates before generating
- **Secure Random Generation**: Uses cryptographically secure methods
- **Format Validation**: Ensures IDs meet specification requirements
- **Type Safety**: TypeScript-friendly with proper type definitions

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage support required for persistence
- Clipboard API support for copy functionality (with fallback)

## Performance

- Lightweight utility (~5KB minified)
- Fast ID generation (< 1ms per ID)
- Efficient duplicate checking with Set data structure
- Minimal memory footprint

## Future Enhancements

- [ ] QR code generation for IDs
- [ ] Batch ID generation
- [ ] Export/import functionality
- [ ] Custom ID format templates
- [ ] Integration with backend APIs
- [ ] ID expiration tracking 