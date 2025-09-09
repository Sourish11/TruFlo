import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent } from './Card';
import UnlockButton from './UnlockButton';
import * as topojson from 'topojson-client';

// Comprehensive list of all countries with their coordinates
const countries = [
  // North America
  { name: 'United States', code: 'US', lat: 39.8283, lng: -98.5795, flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', lat: 56.1304, lng: -106.3468, flag: '🇨🇦' },
  { name: 'Mexico', code: 'MX', lat: 23.6345, lng: -102.5528, flag: '🇲🇽' },
  { name: 'Guatemala', code: 'GT', lat: 15.7835, lng: -90.2308, flag: '🇬🇹' },
  { name: 'Belize', code: 'BZ', lat: 17.1899, lng: -88.4976, flag: '🇧🇿' },
  { name: 'El Salvador', code: 'SV', lat: 13.7942, lng: -88.8965, flag: '🇸🇻' },
  { name: 'Honduras', code: 'HN', lat: 15.2000, lng: -86.2419, flag: '🇭🇳' },
  { name: 'Nicaragua', code: 'NI', lat: 12.2650, lng: -85.2072, flag: '🇳🇮' },
  { name: 'Costa Rica', code: 'CR', lat: 9.7489, lng: -83.7534, flag: '🇨🇷' },
  { name: 'Panama', code: 'PA', lat: 8.5380, lng: -80.7821, flag: '🇵🇦' },
  { name: 'Cuba', code: 'CU', lat: 21.5218, lng: -77.7812, flag: '🇨🇺' },
  { name: 'Jamaica', code: 'JM', lat: 18.1096, lng: -77.2975, flag: '🇯🇲' },
  { name: 'Haiti', code: 'HT', lat: 18.9712, lng: -72.2852, flag: '🇭🇹' },
  { name: 'Dominican Republic', code: 'DO', lat: 18.7357, lng: -70.1627, flag: '🇩🇴' },

  // South America
  { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253, flag: '🇧🇷' },
  { name: 'Argentina', code: 'AR', lat: -38.4161, lng: -63.6167, flag: '🇦🇷' },
  { name: 'Chile', code: 'CL', lat: -35.6751, lng: -71.5430, flag: '🇨🇱' },
  { name: 'Colombia', code: 'CO', lat: 4.5709, lng: -74.2973, flag: '🇨🇴' },
  { name: 'Peru', code: 'PE', lat: -9.1900, lng: -75.0152, flag: '🇵🇪' },
  { name: 'Venezuela', code: 'VE', lat: 6.4238, lng: -66.5897, flag: '🇻🇪' },
  { name: 'Ecuador', code: 'EC', lat: -1.8312, lng: -78.1834, flag: '🇪🇨' },
  { name: 'Bolivia', code: 'BO', lat: -16.2902, lng: -63.5887, flag: '🇧🇴' },
  { name: 'Paraguay', code: 'PY', lat: -23.4425, lng: -58.4438, flag: '🇵🇾' },
  { name: 'Uruguay', code: 'UY', lat: -32.5228, lng: -55.7658, flag: '🇺🇾' },
  { name: 'Guyana', code: 'GY', lat: 4.8604, lng: -58.9302, flag: '🇬🇾' },
  { name: 'Suriname', code: 'SR', lat: 3.9193, lng: -56.0278, flag: '🇸🇷' },

  // Europe
  { name: 'United Kingdom', code: 'GB', lat: 55.3781, lng: -3.4360, flag: '🇬🇧' },
  { name: 'France', code: 'FR', lat: 46.2276, lng: 2.2137, flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515, flag: '🇩🇪' },
  { name: 'Italy', code: 'IT', lat: 41.8719, lng: 12.5674, flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', lat: 40.4637, lng: -3.7492, flag: '🇪🇸' },
  { name: 'Portugal', code: 'PT', lat: 39.3999, lng: -8.2245, flag: '🇵🇹' },
  { name: 'Netherlands', code: 'NL', lat: 52.1326, lng: 5.2913, flag: '🇳🇱' },
  { name: 'Belgium', code: 'BE', lat: 50.5039, lng: 4.4699, flag: '🇧🇪' },
  { name: 'Switzerland', code: 'CH', lat: 46.8182, lng: 8.2275, flag: '🇨🇭' },
  { name: 'Austria', code: 'AT', lat: 47.5162, lng: 14.5501, flag: '🇦🇹' },
  { name: 'Poland', code: 'PL', lat: 51.9194, lng: 19.1451, flag: '🇵🇱' },
  { name: 'Czech Republic', code: 'CZ', lat: 49.8175, lng: 15.4730, flag: '🇨🇿' },
  { name: 'Slovakia', code: 'SK', lat: 48.6690, lng: 19.6990, flag: '🇸🇰' },
  { name: 'Hungary', code: 'HU', lat: 47.1625, lng: 19.5033, flag: '🇭🇺' },
  { name: 'Romania', code: 'RO', lat: 45.9432, lng: 24.9668, flag: '🇷🇴' },
  { name: 'Bulgaria', code: 'BG', lat: 42.7339, lng: 25.4858, flag: '🇧🇬' },
  { name: 'Greece', code: 'GR', lat: 39.0742, lng: 21.8243, flag: '🇬🇷' },
  { name: 'Croatia', code: 'HR', lat: 45.1000, lng: 15.2000, flag: '🇭🇷' },
  { name: 'Serbia', code: 'RS', lat: 44.0165, lng: 21.0059, flag: '🇷🇸' },
  { name: 'Slovenia', code: 'SI', lat: 46.1512, lng: 14.9955, flag: '🇸🇮' },
  { name: 'Bosnia and Herzegovina', code: 'BA', lat: 43.9159, lng: 17.6791, flag: '🇧🇦' },
  { name: 'Montenegro', code: 'ME', lat: 42.7087, lng: 19.3744, flag: '🇲🇪' },
  { name: 'Albania', code: 'AL', lat: 41.1533, lng: 20.1683, flag: '🇦🇱' },
  { name: 'North Macedonia', code: 'MK', lat: 41.6086, lng: 21.7453, flag: '🇲🇰' },
  { name: 'Sweden', code: 'SE', lat: 60.1282, lng: 18.6435, flag: '🇸🇪' },
  { name: 'Norway', code: 'NO', lat: 60.4720, lng: 8.4689, flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', lat: 56.2639, lng: 9.5018, flag: '🇩🇰' },
  { name: 'Finland', code: 'FI', lat: 61.9241, lng: 25.7482, flag: '🇫🇮' },
  { name: 'Iceland', code: 'IS', lat: 64.9631, lng: -19.0208, flag: '🇮🇸' },
  { name: 'Ireland', code: 'IE', lat: 53.4129, lng: -8.2439, flag: '🇮🇪' },
  { name: 'Estonia', code: 'EE', lat: 58.5953, lng: 25.0136, flag: '🇪🇪' },
  { name: 'Latvia', code: 'LV', lat: 56.8796, lng: 24.6032, flag: '🇱🇻' },
  { name: 'Lithuania', code: 'LT', lat: 55.1694, lng: 23.8813, flag: '🇱🇹' },
  { name: 'Belarus', code: 'BY', lat: 53.7098, lng: 27.9534, flag: '🇧🇾' },
  { name: 'Ukraine', code: 'UA', lat: 48.3794, lng: 31.1656, flag: '🇺🇦' },
  { name: 'Moldova', code: 'MD', lat: 47.4116, lng: 28.3699, flag: '🇲🇩' },

  // Asia
  { name: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188, flag: '🇷🇺' },
  { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954, flag: '🇨🇳' },
  { name: 'India', code: 'IN', lat: 20.5937, lng: 78.9629, flag: '🇮🇳' },
  { name: 'Japan', code: 'JP', lat: 36.2048, lng: 138.2529, flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', lat: 35.9078, lng: 127.7669, flag: '🇰🇷' },
  { name: 'North Korea', code: 'KP', lat: 40.3399, lng: 127.5101, flag: '🇰🇵' },
  { name: 'Indonesia', code: 'ID', lat: -0.7893, lng: 113.9213, flag: '🇮🇩' },
  { name: 'Thailand', code: 'TH', lat: 15.8700, lng: 100.9925, flag: '🇹🇭' },
  { name: 'Vietnam', code: 'VN', lat: 14.0583, lng: 108.2772, flag: '🇻🇳' },
  { name: 'Philippines', code: 'PH', lat: 12.8797, lng: 121.7740, flag: '🇵🇭' },
  { name: 'Malaysia', code: 'MY', lat: 4.2105, lng: 101.9758, flag: '🇲🇾' },
  { name: 'Singapore', code: 'SG', lat: 1.3521, lng: 103.8198, flag: '🇸🇬' },
  { name: 'Myanmar', code: 'MM', lat: 21.9162, lng: 95.9560, flag: '🇲🇲' },
  { name: 'Cambodia', code: 'KH', lat: 12.5657, lng: 104.9910, flag: '🇰🇭' },
  { name: 'Laos', code: 'LA', lat: 19.8563, lng: 102.4955, flag: '🇱🇦' },
  { name: 'Bangladesh', code: 'BD', lat: 23.6850, lng: 90.3563, flag: '🇧🇩' },
  { name: 'Pakistan', code: 'PK', lat: 30.3753, lng: 69.3451, flag: '🇵🇰' },
  { name: 'Afghanistan', code: 'AF', lat: 33.9391, lng: 67.7100, flag: '🇦🇫' },
  { name: 'Iran', code: 'IR', lat: 32.4279, lng: 53.6880, flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', lat: 33.2232, lng: 43.6793, flag: '🇮🇶' },
  { name: 'Turkey', code: 'TR', lat: 38.9637, lng: 35.2433, flag: '🇹🇷' },
  { name: 'Saudi Arabia', code: 'SA', lat: 23.8859, lng: 45.0792, flag: '🇸🇦' },
  { name: 'United Arab Emirates', code: 'AE', lat: 23.4241, lng: 53.8478, flag: '🇦🇪' },
  { name: 'Qatar', code: 'QA', lat: 25.3548, lng: 51.1839, flag: '🇶🇦' },
  { name: 'Kuwait', code: 'KW', lat: 29.3117, lng: 47.4818, flag: '🇰🇼' },
  { name: 'Bahrain', code: 'BH', lat: 25.9304, lng: 50.6378, flag: '🇧🇭' },
  { name: 'Oman', code: 'OM', lat: 21.4735, lng: 55.9754, flag: '🇴🇲' },
  { name: 'Yemen', code: 'YE', lat: 15.5527, lng: 48.5164, flag: '🇾🇪' },
  { name: 'Jordan', code: 'JO', lat: 30.5852, lng: 36.2384, flag: '🇯🇴' },
  { name: 'Lebanon', code: 'LB', lat: 33.8547, lng: 35.8623, flag: '🇱🇧' },
  { name: 'Syria', code: 'SY', lat: 34.8021, lng: 38.9968, flag: '🇸🇾' },
  { name: 'Israel', code: 'IL', lat: 31.0461, lng: 34.8516, flag: '🇮🇱' },
  { name: 'Palestine', code: 'PS', lat: 31.9522, lng: 35.2332, flag: '🇵🇸' },
  { name: 'Cyprus', code: 'CY', lat: 35.1264, lng: 33.4299, flag: '🇨🇾' },
  { name: 'Georgia', code: 'GE', lat: 42.3154, lng: 43.3569, flag: '🇬🇪' },
  { name: 'Armenia', code: 'AM', lat: 40.0691, lng: 45.0382, flag: '🇦🇲' },
  { name: 'Azerbaijan', code: 'AZ', lat: 40.1431, lng: 47.5769, flag: '🇦🇿' },
  { name: 'Kazakhstan', code: 'KZ', lat: 48.0196, lng: 66.9237, flag: '🇰🇿' },
  { name: 'Uzbekistan', code: 'UZ', lat: 41.3775, lng: 64.5853, flag: '🇺🇿' },
  { name: 'Turkmenistan', code: 'TM', lat: 38.9697, lng: 59.5563, flag: '🇹🇲' },
  { name: 'Kyrgyzstan', code: 'KG', lat: 41.2044, lng: 74.7661, flag: '🇰🇬' },
  { name: 'Tajikistan', code: 'TJ', lat: 38.8610, lng: 71.2761, flag: '🇹🇯' },
  { name: 'Mongolia', code: 'MN', lat: 46.8625, lng: 103.8467, flag: '🇲🇳' },
  { name: 'Nepal', code: 'NP', lat: 28.3949, lng: 84.1240, flag: '🇳🇵' },
  { name: 'Bhutan', code: 'BT', lat: 27.5142, lng: 90.4336, flag: '🇧🇹' },
  { name: 'Sri Lanka', code: 'LK', lat: 7.8731, lng: 80.7718, flag: '🇱🇰' },
  { name: 'Maldives', code: 'MV', lat: 3.2028, lng: 73.2207, flag: '🇲🇻' },

  // Africa
  { name: 'Egypt', code: 'EG', lat: 26.8206, lng: 30.8025, flag: '🇪🇬' },
  { name: 'Libya', code: 'LY', lat: 26.3351, lng: 17.2283, flag: '🇱🇾' },
  { name: 'Tunisia', code: 'TN', lat: 33.8869, lng: 9.5375, flag: '🇹🇳' },
  { name: 'Algeria', code: 'DZ', lat: 28.0339, lng: 1.6596, flag: '🇩🇿' },
  { name: 'Morocco', code: 'MA', lat: 31.7917, lng: -7.0926, flag: '🇲🇦' },
  { name: 'Sudan', code: 'SD', lat: 12.8628, lng: 30.2176, flag: '🇸🇩' },
  { name: 'South Sudan', code: 'SS', lat: 6.8770, lng: 31.3070, flag: '🇸🇸' },
  { name: 'Ethiopia', code: 'ET', lat: 9.1450, lng: 40.4897, flag: '🇪🇹' },
  { name: 'Eritrea', code: 'ER', lat: 15.1794, lng: 39.7823, flag: '🇪🇷' },
  { name: 'Djibouti', code: 'DJ', lat: 11.8251, lng: 42.5903, flag: '🇩🇯' },
  { name: 'Somalia', code: 'SO', lat: 5.1521, lng: 46.1996, flag: '🇸🇴' },
  { name: 'Kenya', code: 'KE', lat: -0.0236, lng: 37.9062, flag: '🇰🇪' },
  { name: 'Uganda', code: 'UG', lat: 1.3733, lng: 32.2903, flag: '🇺🇬' },
  { name: 'Tanzania', code: 'TZ', lat: -6.3690, lng: 34.8888, flag: '🇹🇿' },
  { name: 'Rwanda', code: 'RW', lat: -1.9403, lng: 29.8739, flag: '🇷🇼' },
  { name: 'Burundi', code: 'BI', lat: -3.3731, lng: 29.9189, flag: '🇧🇮' },
  { name: 'Democratic Republic of Congo', code: 'CD', lat: -4.0383, lng: 21.7587, flag: '🇨🇩' },
  { name: 'Republic of Congo', code: 'CG', lat: -0.2280, lng: 15.8277, flag: '🇨🇬' },
  { name: 'Central African Republic', code: 'CF', lat: 6.6111, lng: 20.9394, flag: '🇨🇫' },
  { name: 'Chad', code: 'TD', lat: 15.4542, lng: 18.7322, flag: '🇹🇩' },
  { name: 'Cameroon', code: 'CM', lat: 7.3697, lng: 12.3547, flag: '🇨🇲' },
  { name: 'Nigeria', code: 'NG', lat: 9.0820, lng: 8.6753, flag: '🇳🇬' },
  { name: 'Niger', code: 'NE', lat: 17.6078, lng: 8.0817, flag: '🇳🇪' },
  { name: 'Mali', code: 'ML', lat: 17.5707, lng: -3.9962, flag: '🇲🇱' },
  { name: 'Burkina Faso', code: 'BF', lat: 12.2383, lng: -1.5616, flag: '🇧🇫' },
  { name: 'Ghana', code: 'GH', lat: 7.9465, lng: -1.0232, flag: '🇬🇭' },
  { name: 'Togo', code: 'TG', lat: 8.6195, lng: 0.8248, flag: '🇹🇬' },
  { name: 'Benin', code: 'BJ', lat: 9.3077, lng: 2.3158, flag: '🇧🇯' },
  { name: 'Ivory Coast', code: 'CI', lat: 7.5400, lng: -5.5471, flag: '🇨🇮' },
  { name: 'Liberia', code: 'LR', lat: 6.4281, lng: -9.4295, flag: '🇱🇷' },
  { name: 'Sierra Leone', code: 'SL', lat: 8.4606, lng: -11.7799, flag: '🇸🇱' },
  { name: 'Guinea', code: 'GN', lat: 9.9456, lng: -9.6966, flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: 'GW', lat: 11.8037, lng: -15.1804, flag: '🇬🇼' },
  { name: 'Senegal', code: 'SN', lat: 14.4974, lng: -14.4524, flag: '🇸🇳' },
  { name: 'Gambia', code: 'GM', lat: 13.4432, lng: -15.3101, flag: '🇬🇲' },
  { name: 'Mauritania', code: 'MR', lat: 21.0079, lng: -10.9408, flag: '🇲🇷' },
  { name: 'South Africa', code: 'ZA', lat: -30.5595, lng: 22.9375, flag: '🇿🇦' },
  { name: 'Namibia', code: 'NA', lat: -22.9576, lng: 18.4904, flag: '🇳🇦' },
  { name: 'Botswana', code: 'BW', lat: -22.3285, lng: 24.6849, flag: '🇧🇼' },
  { name: 'Zimbabwe', code: 'ZW', lat: -19.0154, lng: 29.1549, flag: '🇿🇼' },
  { name: 'Zambia', code: 'ZM', lat: -13.1339, lng: 27.8493, flag: '🇿🇲' },
  { name: 'Malawi', code: 'MW', lat: -13.2543, lng: 34.3015, flag: '🇲🇼' },
  { name: 'Mozambique', code: 'MZ', lat: -18.6657, lng: 35.5296, flag: '🇲🇿' },
  { name: 'Madagascar', code: 'MG', lat: -18.7669, lng: 46.8691, flag: '🇲🇬' },
  { name: 'Mauritius', code: 'MU', lat: -20.3484, lng: 57.5522, flag: '🇲🇺' },
  { name: 'Seychelles', code: 'SC', lat: -4.6796, lng: 55.4920, flag: '🇸🇨' },
  { name: 'Comoros', code: 'KM', lat: -11.8750, lng: 43.8722, flag: '🇰🇲' },
  { name: 'Angola', code: 'AO', lat: -11.2027, lng: 17.8739, flag: '🇦🇴' },
  { name: 'Gabon', code: 'GA', lat: -0.8037, lng: 11.6094, flag: '🇬🇦' },
  { name: 'Equatorial Guinea', code: 'GQ', lat: 1.6508, lng: 10.2679, flag: '🇬🇶' },
  { name: 'Sao Tome and Principe', code: 'ST', lat: 0.1864, lng: 6.6131, flag: '🇸🇹' },
  { name: 'Cape Verde', code: 'CV', lat: 16.5388, lng: -24.0132, flag: '🇨🇻' },
  { name: 'Lesotho', code: 'LS', lat: -29.6100, lng: 28.2336, flag: '🇱🇸' },
  { name: 'Eswatini', code: 'SZ', lat: -26.5225, lng: 31.4659, flag: '🇸🇿' },

  // Oceania
  { name: 'Australia', code: 'AU', lat: -25.2744, lng: 133.7751, flag: '🇦🇺' },
  { name: 'New Zealand', code: 'NZ', lat: -40.9006, lng: 174.8860, flag: '🇳🇿' },
  { name: 'Papua New Guinea', code: 'PG', lat: -6.3150, lng: 143.9555, flag: '🇵🇬' },
  { name: 'Fiji', code: 'FJ', lat: -16.5780, lng: 179.4144, flag: '🇫🇯' },
  { name: 'Solomon Islands', code: 'SB', lat: -9.6457, lng: 160.1562, flag: '🇸🇧' },
  { name: 'Vanuatu', code: 'VU', lat: -15.3767, lng: 166.9592, flag: '🇻🇺' },
  { name: 'Samoa', code: 'WS', lat: -13.7590, lng: -172.1046, flag: '🇼🇸' },
  { name: 'Tonga', code: 'TO', lat: -21.1789, lng: -175.1982, flag: '🇹🇴' },
  { name: 'Kiribati', code: 'KI', lat: -3.3704, lng: -168.7340, flag: '🇰🇮' },
  { name: 'Tuvalu', code: 'TV', lat: -7.1095, lng: 177.6493, flag: '🇹🇻' },
  { name: 'Nauru', code: 'NR', lat: -0.5228, lng: 166.9315, flag: '🇳🇷' },
  { name: 'Palau', code: 'PW', lat: 7.5150, lng: 134.5825, flag: '🇵🇼' },
  { name: 'Marshall Islands', code: 'MH', lat: 7.1315, lng: 171.1845, flag: '🇲🇭' },
  { name: 'Micronesia', code: 'FM', lat: 7.4256, lng: 150.5508, flag: '🇫🇲' }
];

const moodTypes = [
  { name: 'Energized', color: '#10B981', emoji: '😄' },
  { name: 'Focused', color: '#3B82F6', emoji: '🙂' },
  { name: 'Meh', color: '#6B7280', emoji: '😐' },
  { name: 'Overwhelmed', color: '#EF4444', emoji: '😫' }
];

// Convert lat/lng to 3D coordinates on sphere
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Helper function to draw polygon on canvas
const drawPolygon = (ctx, coordinates, fill = true, stroke = false) => {
  if (!coordinates || coordinates.length === 0) return;
  
  ctx.beginPath();
  coordinates.forEach((coord, index) => {
    // Convert longitude/latitude to canvas coordinates
    const x = ((coord[0] + 180) / 360) * 2048;
    const y = ((90 - coord[1]) / 180) * 1024;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
};

// Helper function to draw GeoJSON feature
const drawFeature = (ctx, feature, fill = true, stroke = false) => {
  if (!feature || !feature.geometry || !feature.geometry.coordinates) return;
  
  const { type, coordinates } = feature.geometry;
  
  if (type === 'Polygon') {
    // Single polygon - coordinates is an array of rings
    coordinates.forEach(ring => {
      drawPolygon(ctx, ring, fill, stroke);
    });
  } else if (type === 'MultiPolygon') {
    // Multiple polygons - coordinates is an array of polygons
    coordinates.forEach(polygon => {
      polygon.forEach(ring => {
        drawPolygon(ctx, ring, fill, stroke);
      });
    });
  }
};

// Stars component for beautiful space background
function Stars() {
  const starsRef = useRef();
  
  // Generate random star positions
  const starPositions = useMemo(() => {
    const positions = new Float32Array(2000 * 3); // 2000 stars
    
    for (let i = 0; i < 2000; i++) {
      // Generate stars in a sphere around the Earth
      const radius = 15 + Math.random() * 35; // Distance from center
      const theta = Math.random() * Math.PI * 2; // Horizontal angle
      const phi = Math.random() * Math.PI; // Vertical angle
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    return positions;
  }, []);

  // Gentle twinkling animation
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002; // Very slow rotation
    }
  });

  return (
    <Points ref={starsRef} positions={starPositions}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        opacity={0.8}
      />
    </Points>
  );
}

// Country Label Component with hover functionality
function CountryLabel({ country, countryMoods, position }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Count moods by type
  const moodCounts = {};
  moodTypes.forEach(mood => {
    moodCounts[mood.name] = countryMoods.filter(m => m.mood === mood.name).length;
  });
  
  const totalCount = countryMoods.length;
  
  return (
    <Html key={country.code} position={position} center>
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Simple number display (always visible) */}
        <div className="bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-lg text-sm font-bold whitespace-nowrap pointer-events-auto border border-white/30 cursor-pointer hover:bg-white/30 transition-all duration-200 min-w-[32px] text-center">
          {totalCount}
        </div>
        
        {/* Detailed breakdown (on hover) */}
        {isHovered && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/25 backdrop-blur-lg text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap pointer-events-none border border-white/40 z-10 animate-fade-in">
            <div className="flex items-center space-x-2 font-semibold mb-2 text-center">
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
            </div>
            <div className="space-y-1">
              {moodTypes.map(mood => {
                const count = moodCounts[mood.name];
                if (count === 0) return null;
                return (
                  <div key={mood.name} className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-1">
                      <span>{mood.emoji}</span>
                      <span className="text-xs">{mood.name}</span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-white/30 mt-2 pt-1 text-center">
              <span className="text-white/80 text-xs">Total: {totalCount}</span>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

// Earth component with perfect geometry using world-atlas data
function Earth({ userMoods, selectedCountry, selectedMood, earthRef }) {
  const [worldData, setWorldData] = useState(null);

  // Load world atlas data for perfect geography
  useEffect(() => {
    const loadWorldData = async () => {
      try {
        // Load world atlas data
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        const world = await response.json();
        
        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(world, world.objects.countries);
        const land = topojson.feature(world, world.objects.land);
        
        setWorldData({ countries, land });
      } catch (error) {
        console.error('Failed to load world data:', error);
        // Fallback to simple geometry if loading fails
        setWorldData(null);
      }
    };

    loadWorldData();
  }, []);

  // Create Earth texture with perfect geography and subtle country borders
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Ocean background - deep blue
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 2048, 1024);
    
    if (worldData && worldData.land) {
      // Use real world data for perfect geography
      ctx.fillStyle = '#059669'; // Land color - forest green
      
      // Draw land masses using GeoJSON data
      if (worldData.land.features) {
        // FeatureCollection - iterate through features
        worldData.land.features.forEach(feature => {
          drawFeature(ctx, feature, true, false);
        });
      } else if (worldData.land.geometry) {
        // Single Feature - draw directly
        drawFeature(ctx, worldData.land, true, false);
      }
    } else {
      // Fallback: Simple geometric shapes for major continents
      ctx.fillStyle = '#059669';
      
      // North America
      ctx.beginPath();
      ctx.ellipse(300, 250, 120, 80, 0.2, 0, 2 * Math.PI);
      ctx.fill();
      
      // South America
      ctx.beginPath();
      ctx.ellipse(400, 450, 60, 120, 0.1, 0, 2 * Math.PI);
      ctx.fill();
      
      // Europe
      ctx.beginPath();
      ctx.ellipse(1000, 220, 80, 50, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Africa
      ctx.beginPath();
      ctx.ellipse(1050, 400, 80, 140, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Asia
      ctx.beginPath();
      ctx.ellipse(1400, 280, 200, 100, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Australia
      ctx.beginPath();
      ctx.ellipse(1550, 650, 80, 40, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw very subtle country borders if we have country data
    if (worldData && worldData.countries) {
      ctx.strokeStyle = '#1e40af'; // Subtle blue borders
      ctx.lineWidth = 0.5; // Thinner lines
      ctx.globalAlpha = 0.3; // More transparent
      
      if (worldData.countries.features) {
        // FeatureCollection - iterate through features
        worldData.countries.features.forEach(feature => {
          drawFeature(ctx, feature, false, true);
        });
      } else if (worldData.countries.geometry) {
        // Single Feature - draw directly
        drawFeature(ctx, worldData.countries, false, true);
      }
      
      ctx.globalAlpha = 1.0; // Reset alpha
    }
    
    // FIXED: Proper ice caps with correct positioning and no white planes
    ctx.fillStyle = '#e0f2fe'; // Light blue ice color instead of white
    
    // Arctic ice cap - smaller and properly positioned
    ctx.beginPath();
    ctx.ellipse(1024, 30, 300, 25, 0, 0, 2 * Math.PI); // Reduced size and moved up
    ctx.fill();
    
    // Antarctic ice cap - smaller and properly positioned  
    ctx.beginPath();
    ctx.ellipse(1024, 994, 350, 25, 0, 0, 2 * Math.PI); // Reduced size and moved down
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
  }, [worldData]);

  return (
    <group>
      {/* Main Earth sphere with perfect geometry */}
      <Sphere ref={earthRef} args={[2, 128, 64]}>
        <meshPhongMaterial 
          map={earthTexture}
          transparent
          opacity={0.95}
          shininess={30}
          specular="#4FC3F7"
        />
      </Sphere>
      
      {/* Atmosphere layers */}
      <Sphere args={[2.05, 64, 32]}>
        <meshBasicMaterial 
          color="#87CEEB"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
      
      <Sphere args={[2.15, 32, 16]}>
        <meshBasicMaterial 
          color="#4FC3F7"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Country glow effects for selected country */}
      {selectedCountry && selectedMood && (
        (() => {
          const country = countries.find(c => c.code === selectedCountry);
          if (!country) return null;
          
          const position = latLngToVector3(country.lat, country.lng, 2.18);
          const moodType = moodTypes.find(m => m.name === selectedMood);
          
          return (
            <group key={`glow-${selectedCountry}`} position={position}>
              {/* Large glow effect for selected country */}
              <Sphere args={[0.25, 32, 32]}>
                <meshBasicMaterial 
                  color={moodType?.color || '#8B5CF6'}
                  transparent
                  opacity={0.3}
                />
              </Sphere>
              
              {/* Medium glow */}
              <Sphere args={[0.18, 24, 24]}>
                <meshBasicMaterial 
                  color={moodType?.color || '#8B5CF6'}
                  transparent
                  opacity={0.5}
                />
              </Sphere>
              
              {/* Inner bright core */}
              <Sphere args={[0.12, 16, 16]}>
                <meshBasicMaterial 
                  color={moodType?.color || '#8B5CF6'}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            </group>
          );
        })()
      )}
      
      {/* Mood markers for submitted moods */}
      {userMoods.map((mood, index) => {
        const country = countries.find(c => c.code === mood.country);
        if (!country) return null;
        
        const position = latLngToVector3(country.lat, country.lng, 2.18);
        const moodType = moodTypes.find(m => m.name === mood.mood);
        
        return (
          <group key={`${mood.id}-${index}`} position={position}>
            {/* Main mood marker */}
            <Sphere args={[0.06, 16, 16]}>
              <meshBasicMaterial 
                color={moodType?.color || '#8B5CF6'}
                transparent
                opacity={0.9}
              />
            </Sphere>
            
            {/* Pulsing effect */}
            <Sphere args={[0.09, 16, 16]}>
              <meshBasicMaterial 
                color={moodType?.color || '#8B5CF6'}
                transparent
                opacity={0.4}
              />
            </Sphere>
            
            {/* Glow effect */}
            <Sphere args={[0.12, 16, 16]}>
              <meshBasicMaterial 
                color={moodType?.color || '#8B5CF6'}
                transparent
                opacity={0.1}
              />
            </Sphere>
          </group>
        );
      })}
      
      {/* Country labels with hover functionality */}
      {countries.map((country) => {
        const position = latLngToVector3(country.lat, country.lng, 2.4);
        const countryMoods = userMoods.filter(m => m.country === country.code);
        
        if (countryMoods.length === 0) return null;
        
        return (
          <CountryLabel
            key={country.code}
            country={country}
            countryMoods={countryMoods}
            position={position}
          />
        );
      })}
    </group>
  );
}

// Main 3D Earth component
export default function Interactive3DEarth() {
  // Form state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  // Persistent state for global mood map
  const [userMoods, setUserMoods] = useState([]);
  
  // Unlock state
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Ref for Earth to control rotation manually
  const earthRef = useRef();

  useEffect(() => {
    // Load persistent mood data
    const savedMoods = localStorage.getItem('earthUserMoods');
    
    if (savedMoods) {
      const moods = JSON.parse(savedMoods);
      setUserMoods(moods);
    }
  }, []);

  const handleSubmitMood = () => {
    if (!selectedCountry || !selectedMood) return;
    
    const newMood = {
      id: Math.random().toString(36).substr(2, 9),
      country: selectedCountry,
      mood: selectedMood,
      timestamp: Date.now()
    };
    
    const updatedMoods = [...userMoods, newMood];
    setUserMoods(updatedMoods);
    
    // Save mood data
    localStorage.setItem('earthUserMoods', JSON.stringify(updatedMoods));
    
    // Reset form
    setSelectedCountry('');
    setSelectedMood('');
    
    // Trigger small celebration
    if (window.confetti) {
      window.confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: [moodTypes.find(m => m.name === selectedMood)?.color || '#8B5CF6']
      });
    }
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  return (
    <Card className="glass-enhanced shadow-xl">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white font-heading">
            🌍 Global Mood Map
          </h3>
          <p className="text-white/70 text-sm mt-1 font-body">
            Share your mood and see how the world feels • Hover over numbers for details
          </p>
        </div>
        
        {!isUnlocked ? (
          <UnlockButton
            unlockThreshold={35}
            onUnlock={handleUnlock}
            storageKey="moodMapUnlock"
            className="w-full"
          >
            <div className="space-y-4 animate-fade-in">
              {/* 3D Earth Canvas with beautiful starry space background */}
              <div className="h-64 mb-4 rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-white/10">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  {/* Deep space background */}
                  <color attach="background" args={['#0a0a0a']} />
                  
                  {/* Beautiful starfield */}
                  <Stars />
                  
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                  <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4FC3F7" />
                  <pointLight position={[0, 10, 0]} intensity={0.4} color="#87CEEB" />
                  
                  <Earth 
                    userMoods={userMoods} 
                    selectedCountry={selectedCountry}
                    selectedMood={selectedMood}
                    earthRef={earthRef}
                  />
                  
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={8}
                    autoRotate={false}
                    autoRotateSpeed={0}
                  />
                </Canvas>
              </div>
              
              {/* Mood Submission Interface */}
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="p-2 glass-button rounded-lg text-white text-sm font-body"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.code} className="bg-gray-800">
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="p-2 glass-button rounded-lg text-white text-sm font-body"
                  >
                    <option value="">Select Mood</option>
                    {moodTypes.map(mood => (
                      <option key={mood.name} value={mood.name} className="bg-gray-800">
                        {mood.emoji} {mood.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Preview of selected country glow */}
                {selectedCountry && selectedMood && (
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: moodTypes.find(m => m.name === selectedMood)?.color,
                          boxShadow: `0 0 10px ${moodTypes.find(m => m.name === selectedMood)?.color}40`
                        }}
                      />
                      <span className="text-white/90 text-sm font-body">
                        {countries.find(c => c.code === selectedCountry)?.flag} {countries.find(c => c.code === selectedCountry)?.name} will glow {selectedMood.toLowerCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSubmitMood}
                  disabled={!selectedCountry || !selectedMood}
                  className="w-full glass-button px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-white/20 transition-all duration-300 disabled:cursor-not-allowed font-ui"
                >
                  Add Your Mood to Earth 🌍
                </button>
              </div>
              
              {/* Total submissions counter */}
              <div className="text-center">
                <div className="text-white/60 text-xs font-body">
                  🌍 Total global mood submissions: <span className="font-semibold text-white font-ui">{userMoods.length}</span>
                </div>
              </div>
            </div>
          </UnlockButton>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* 3D Earth Canvas with beautiful starry space background */}
            <div className="h-64 mb-4 rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-white/10">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                {/* Deep space background */}
                <color attach="background" args={['#0a0a0a']} />
                
                {/* Beautiful starfield */}
                <Stars />
                
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4FC3F7" />
                <pointLight position={[0, 10, 0]} intensity={0.4} color="#87CEEB" />
                
                <Earth 
                  userMoods={userMoods} 
                  selectedCountry={selectedCountry}
                  selectedMood={selectedMood}
                  earthRef={earthRef}
                />
                
                <OrbitControls 
                  enableZoom={true}
                  enablePan={false}
                  minDistance={3}
                  maxDistance={8}
                  autoRotate={false}
                  autoRotateSpeed={0}
                />
              </Canvas>
            </div>
            
            {/* Mood Submission Interface */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="p-2 glass-button rounded-lg text-white text-sm font-body"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code} className="bg-gray-800">
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="p-2 glass-button rounded-lg text-white text-sm font-body"
                >
                  <option value="">Select Mood</option>
                  {moodTypes.map(mood => (
                    <option key={mood.name} value={mood.name} className="bg-gray-800">
                      {mood.emoji} {mood.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Preview of selected country glow */}
              {selectedCountry && selectedMood && (
                <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: moodTypes.find(m => m.name === selectedMood)?.color,
                        boxShadow: `0 0 10px ${moodTypes.find(m => m.name === selectedMood)?.color}40`
                      }}
                    />
                    <span className="text-white/90 text-sm font-body">
                      {countries.find(c => c.code === selectedCountry)?.flag} {countries.find(c => c.code === selectedCountry)?.name} will glow {selectedMood.toLowerCase()}
                    </span>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleSubmitMood}
                disabled={!selectedCountry || !selectedMood}
                className="w-full glass-button px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-white/20 transition-all duration-300 disabled:cursor-not-allowed font-ui"
              >
                Add Your Mood to Earth 🌍
              </button>
            </div>
            
            {/* Total submissions counter */}
            <div className="text-center">
              <div className="text-white/60 text-xs font-body">
                🌍 Total global mood submissions: <span className="font-semibold text-white font-ui">{userMoods.length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}