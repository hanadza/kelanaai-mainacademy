const DESTINATION_IMAGES: Record<string, string> = {
  japan: "photo-1493976040374-85c8e12f0c0e",
  indonesia: "photo-1537996194471-e657df975ab4",
  bali: "photo-1537996194471-e657df975ab4",
  thailand: "photo-1552465011-b4e21bf6e79a",
  vietnam: "photo-1528127269322-539801943592",
  malaysia: "photo-1596422846543-75c6fc197f07",
  singapore: "photo-1525625293386-3f8f99389edd",
  philippines: "photo-1518509562904-e7ef99cdcc86",
  cambodia: "photo-1563492065599-3520f775eeed",
  laos: "photo-1570366583862-f91883984fde",
  "south korea": "photo-1538485399081-7c8972b7d5e5",
  korea: "photo-1538485399081-7c8972b7d5e5",
  china: "photo-1508804185872-d7badad00f7d",
  india: "photo-1524492412937-b28074a5d7da",
  nepal: "photo-1544735716-392fe2489ffa",
  "sri lanka": "photo-1586613830950-3b6a5b3f9b3d",
  taiwan: "photo-1470004914212-05527e49370b",
  mongolia: "photo-1506869640319-fe1a24fd76dc",
  turkey: "photo-1524231757912-21f4fe3a7200",
  "united arab emirates": "photo-1512453979798-5ea266f8880c",
  dubai: "photo-1512453979798-5ea266f8880c",
};

export function getDestinationImage(destination: string): string {
  const name = destination.toLowerCase();

  const matchedCountry = Object.keys(DESTINATION_IMAGES).find((country) =>
    name.includes(country)
  );
  if (matchedCountry) {
    return `https://images.unsplash.com/${DESTINATION_IMAGES[matchedCountry]}?auto=format&fit=crop&w=1400&q=85`;
  }

  if (name.includes("italy")) {
    return "https://images.unsplash.com/photo-1529260830199-42c8a36f70d4?auto=format&fit=crop&w=1400&q=85";
  }
  if (name.includes("peru")) {
    return "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1400&q=85";
  }

  return "/petadunia.webp";
}
