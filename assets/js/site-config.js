/*
  ============================================================
  OHANA BEACH HOUSE: SITE CONFIG
  Everything that is likely to change lives here.
  Only publish details the business has confirmed.
  ============================================================
*/
window.OHANA_CONFIG = {
  contact: {
    phoneDisplay: '+20 102 241 1190',
    phoneHref: 'tel:+201022411190',
    facebook: 'https://www.facebook.com/Ohanabeachhouse0/',
    // Official WhatsApp not yet confirmed. Add e.g. 'https://wa.me/201022411190' once verified.
    whatsapp: '',
  },

  location: {
    // Official Google Maps pin not yet confirmed. When it is:
    //  - mapUrl:      the "Share > Copy link" URL (enables the Get Directions buttons)
    //  - mapEmbedUrl: the "Share > Embed a map" iframe src (replaces the map placeholder)
    mapUrl: '',
    mapEmbedUrl: '',
  },

  /*
    Inquiry form delivery. Nothing is sent until a provider is configured,
    and the form says so honestly instead of faking success.

    provider: 'none' | 'formspree' | 'webhook' | 'emailjs'
      formspree -> endpoint: 'https://formspree.io/f/xxxxxxx'
      webhook   -> endpoint: any URL that accepts a JSON POST (GoHighLevel inbound webhook, custom backend, etc.)
      emailjs   -> emailjs: { serviceId, templateId, publicKey }
  */
  form: {
    provider: 'none',
    endpoint: '',
    emailjs: { serviceId: '', templateId: '', publicKey: '' },
  },

  /*
    EVENTS: add confirmed events only. Leave the array empty to show the
    "New dates are coming soon" state. Past events (date before today) hide automatically.

    {
      title: 'Sunset Session',
      date: '2027-07-18',            // YYYY-MM-DD
      startTime: '18:00',            // 24h, optional
      image: 'assets/img/night-stage-960.webp',
      imageAlt: 'Stage lights at Ohana Beach House',
      description: 'One or two short sentences.',
      lineup: ['Artist One', 'Artist Two'],   // optional
      organizer: 'Organizer name',           // optional
      entryNote: '21+ · Tickets required',   // optional, only if confirmed
      ticketUrl: 'https://...',              // optional -> "Get Tickets"
      detailsUrl: 'https://...',             // optional -> "View Event"
    }
  */
  events: [],
};
