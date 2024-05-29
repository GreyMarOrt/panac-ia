import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors'

interface Hospital {
  nombre: string;
  direccion: string;
  rating?: number;
  open?: any; // Puedes definir un tipo más específico si es necesario
  photo?: any[]; // Puedes definir un tipo más específico si es necesario
  geometry?: any; // Puedes definir un tipo más específico si es necesario
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
 });

  const { latitud, longitud } = req.query;

  if (typeof latitud !== 'string' || typeof longitud !== 'string') {
    return res.status(400).json({ error: 'Invalid Parameters' });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitud},${longitud}&radius=5000&type=doctor&key=AIzaSyA-oZrhlwEq1NnYp11gT20gVl4IwDBiQ9A`
    );

    const data = await response.json();

    if (data.status === 'OK') {
      const hospitals: Hospital[] = data.results.map((hospital: any) => ({
        nombre: hospital.name,
        direccion: hospital.vicinity,
        rating: hospital.rating,
        open: hospital.opening_hours,
        photo: hospital.photos,
        geometry: hospital.geometry,
      }));

      return res.status(200).json(hospitals);
    } else {
      throw new Error('Error al obtener los hospitales cercanos.');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}