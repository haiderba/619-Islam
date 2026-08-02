const KAABA_LAT = 21.4225; // Mecca Latitude
const KAABA_LNG = 39.8262; // Mecca Longitude

export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  const lambda = (longitude * Math.PI) / 180;

  const y = Math.sin(lambdaK - lambda);
  const x =
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  return (qiblaDeg + 360) % 360;
}
