export function createGoogleMapsSearchUrl(
  location: string,
) {
  const normalizedLocation = location
    .replace(/\s+/g, " ")
    .trim();

  return (
    "https://www.google.com/maps/search/" +
    `?api=1&query=${encodeURIComponent(
      normalizedLocation,
    )}`
  );
}